import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../server/store.js";
import { extractContract } from "../server/extraction.js";
import type { Asset, Extraction } from "../src/types.js";

test("contrato, evidência e ativo persistem no SQLite após reabrir; hash deduplica arquivos", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-storage-"));
  let store = createStore(join(dir, "db.sqlite"));
  try {
    const bytes = Buffer.from("CONTRATO SINTÉTICO PARA TESTE");
    const contract = store.upload("teste.txt", "text/plain", bytes);
    assert.equal(
      store.upload("outro-nome.txt", "text/plain", bytes).id,
      contract.id,
    );
    const asset: Asset = {
      id: "asset-sintetico",
      name: "Ativo sintético",
      model: "",
      patrimony: "TEST-1",
      serial: "",
      sector: "",
      contractId: contract.id,
      periodValue: null,
      periodUnit: "months",
      anchorDate: null,
      anchorType: "",
      reviewed: false,
      notes: "",
      simulated: true,
      updatedAt: "2026-11-07T00:00:00Z",
    };
    store.saveAsset(asset);
    store.close();
    store = createStore(join(dir, "db.sqlite"));
    assert.deepEqual(store.getBytes(contract.id), bytes);
    assert.equal(store.listAssets()[0].contractName, "teste.txt");
    assert.equal(store.listAssets()[0].reviewed, false);
    assert.throws(
      () => store.saveAsset({ ...asset, id: "another" }),
      /UNIQUE constraint/,
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SDK constrói Responses API configurável com arquivo e schema; preserva ausência/conflito sem rede", async () => {
  const saved = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  };
  const missing = {
    value: null,
    status: "missing" as const,
    page: null,
    quote: null,
  };
  const extraction: Extraction = {
    equipment: {
      value: "Bomba sintética",
      status: "found",
      page: 1,
      quote: "Bomba sintética",
    },
    model: missing,
    periodValue: {
      ...missing,
      status: "conflict",
      quote: "6 meses no TR; 12 meses no contrato",
    },
    periodUnit: missing,
    anchorDate: missing,
    anchorType: missing,
    validFrom: missing,
    validUntil: missing,
    warnings: ["Periodicidade conflitante."],
  };
  process.env.OPENAI_API_KEY = "test-not-a-real-key";
  process.env.OPENAI_BASE_URL = "https://provider.invalid/v1";
  process.env.OPENAI_MODEL = "test-model";
  let body: Record<string, any> = {};
  let failure = false;
  const transport = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    assert.equal(String(input), "https://provider.invalid/v1/responses");
    body = JSON.parse(String(init?.body));
    if (failure)
      return new Response(
        JSON.stringify({ error: { message: "synthetic failure" } }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    return new Response(
      JSON.stringify({
        id: "resp_test",
        object: "response",
        created_at: 1,
        status: "completed",
        model: "test-model",
        output: [
          {
            type: "message",
            id: "msg_test",
            status: "completed",
            role: "assistant",
            content: [
              {
                type: "output_text",
                text: JSON.stringify(extraction),
                annotations: [],
              },
            ],
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const result = await extractContract(
      Buffer.from("%PDF- synthetic"),
      "synthetic.pdf",
      "application/pdf",
      transport,
    );
    assert.deepEqual(result, extraction);
    assert.equal(body.model, "test-model");
    assert.equal(body.store, false);
    assert.equal(body.text.format.type, "json_schema");
    assert.equal(body.text.format.strict, true);
    assert.match(
      body.input[0].content[0].file_data,
      /^data:application\/pdf;base64,/,
    );
    assert.match(body.instructions, /dado não confiável/);
    failure = true;
    await assert.rejects(() =>
      extractContract(Buffer.from("test"), "test.txt", "text/plain", transport),
    );
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(
      () =>
        extractContract(
          Buffer.from("test"),
          "test.txt",
          "text/plain",
          transport,
        ),
      /AI_NOT_CONFIGURED/,
    );
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
