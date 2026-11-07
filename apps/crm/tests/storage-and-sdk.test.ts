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
      brand: "Marca sintética",
      model: "Modelo sintético",
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
    const orphan = store.upload(
      "sem-equipamento.txt",
      "text/plain",
      Buffer.from("Documento sintético ainda sem vínculo"),
    );
    const summaries = store.listContracts();
    assert.equal(summaries.length, 2);
    assert.deepEqual(
      new Set(summaries.map((item) => item.id)),
      new Set([contract.id, orphan.id]),
    );
    assert.equal(
      summaries.some((item) => "extraction" in item || "bytes" in item),
      false,
    );
    store.close();
    store = createStore(join(dir, "db.sqlite"));
    assert.deepEqual(store.getBytes(contract.id), bytes);
    assert.equal(store.listContracts().length, 2);
    assert.equal(store.listAssets()[0].contractName, "teste.txt");
    assert.equal(store.listAssets()[0].reviewed, false);
    assert.equal(store.listAssets()[0].brand, "Marca sintética");
    assert.equal(store.listAssets()[0].model, "Modelo sintético");
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
  const equipment = {
    maintenanceCompany: {
      ...missing,
      status: "found",
      value: "Empresa sintética de manutenção",
      quote: "Empresa sintética de manutenção",
    },
    maintenancePhone: {
      ...missing,
      status: "found",
      value: "(11) 5555-0100",
      quote: "(11) 5555-0100",
    },
    maintenanceEmail: {
      ...missing,
      status: "found",
      value: "manutencao@example.test",
      quote: "manutencao@example.test",
    },
    equipment: {
      value: "Bomba sintética",
      status: "found",
      page: 1,
      quote: "Bomba sintética",
    },
    brand: {
      value: "Marca sintética A",
      status: "found" as const,
      page: 1,
      quote: "Marca sintética A",
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
  const extraction: Extraction = {
    version: 2,
    equipments: [
      {
        ...equipment,
        equipment: { ...equipment.equipment, status: "found" },
        periodValue: { ...equipment.periodValue, status: "conflict" },
        periodUnit: { ...equipment.periodUnit, status: "missing" },
        anchorType: { ...equipment.anchorType, status: "found" },
        patrimony: missing,
        serial: missing,
        sector: missing,
        notes: missing,
        quantity: missing,
        firstDueDate: missing,
      } as import("../src/types.js").EquipmentExtraction,
    ],
    warnings: [],
  };
  extraction.equipments.push({
    ...extraction.equipments[0],
    equipment: {
      value: "Monitor sintético",
      status: "found",
      page: 3,
      quote: "Monitor sintético",
    },
    patrimony: { value: "SINT-02", status: "found", page: 3, quote: "SINT-02" },
    brand: {
      value: "Marca sintética B",
      status: "found",
      page: 3,
      quote: "Marca sintética B",
    },
  });
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
        output: [{
                  type: "function_call",
                  id: "fc_test",
                  call_id: "call_test",
                  status: "completed",
                  name: "prepare_equipment_import",
                  arguments: JSON.stringify(extraction),
                }],
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
    assert.deepEqual({ ...result, equipments: result.equipments.map(({ importUnit: _unit, ...fields }) => fields) }, extraction);
    assert.equal(result.equipments.length, 2);
    assert.equal(
      result.equipments[0].maintenanceCompany?.value,
      "Empresa sintética de manutenção",
    );
    assert.equal(
      result.equipments[0].maintenancePhone?.value,
      "(11) 5555-0100",
    );
    assert.equal(
      result.equipments[0].maintenanceEmail?.value,
      "manutencao@example.test",
    );
    assert.equal(result.equipments[1].patrimony.value, "SINT-02");
    assert.equal(result.equipments[0].brand?.value, "Marca sintética A");
    assert.equal(result.equipments[1].brand?.value, "Marca sintética B");
    assert.match(body.instructions, /Não deduza a marca pelo nome do modelo/);
    assert.equal(body.model, "test-model");
    assert.equal(body.store, false);
    assert.equal(body.tools[0].name, "prepare_equipment_import");
    assert.equal(body.tools[0].strict, true);
    assert.deepEqual(body.tool_choice, { type: "function", name: "prepare_equipment_import" });
    assert.equal(body.parallel_tool_calls, false);
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
