import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { createApp } from "../server/app.js";
import type { Extraction } from "../src/types.js";

test("fluxo integrado com arquivo privado, edição, persistência e SDK contra provedor HTTP local de teste", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "consta-test-"));
  let running = createApp({
    database: join(directory, "test.sqlite"),
    password: "test-password",
  });
  let server = running.app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
  } catch (error) {
    running.store.close();
    rmSync(directory, { recursive: true, force: true });
    if ((error as NodeJS.ErrnoException).code === "EPERM") {
      t.skip(
        "O ambiente não permite abrir portas para os servidores HTTP isolados do teste.",
      );
      return;
    }
    throw error;
  }
  let base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  let cookie = "";
  const send = (path: string, init: RequestInit = {}) =>
    fetch(base + path, {
      ...init,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(typeof init.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
      },
    });
  let contractId = "";
  let assetId = "";
  const oldKey = process.env.OPENAI_API_KEY;
  const oldUrl = process.env.OPENAI_BASE_URL;
  const oldModel = process.env.OPENAI_MODEL;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  try {
    await t.test(
      "nega arquivos e registros sem sessão; valida senha e origem",
      async () => {
        assert.equal((await send("/assets")).status, 401);
        assert.equal((await send("/contracts/nao-existe/file")).status, 401);
        assert.equal(
          (
            await send("/login", {
              method: "POST",
              body: JSON.stringify({ password: "wrong" }),
            })
          ).status,
          401,
        );
        const login = await send("/login", {
          method: "POST",
          body: JSON.stringify({ password: "test-password" }),
        });
        assert.equal(login.status, 200);
        cookie = login.headers.get("set-cookie")!.split(";")[0];
        assert.equal(
          (
            await send("/assets", {
              method: "POST",
              headers: { Origin: "https://untrusted.example" },
              body: "{}",
            })
          ).status,
          403,
        );
        assert.equal(
          (await send("/assets", { headers: { Host: "untrusted.example" } }))
            .status,
          403,
        );
      },
    );
    await t.test(
      "upload deduplica por hash e rejeita conteúdo incompatível",
      async () => {
        async function upload(content: string, name: string) {
          const body = new FormData();
          body.append("file", new Blob([content]), name);
          return send("/contracts", { method: "POST", body });
        }
        const response = await upload(
          "Contrato sintético. Preventiva semestral após instalação.",
          "contrato-sintetico.txt",
        );
        assert.equal(response.status, 201);
        const contract = await response.json();
        contractId = contract.id;
        assert.equal(
          (
            await (
              await upload(
                "Contrato sintético. Preventiva semestral após instalação.",
                "reenvio.txt",
              )
            ).json()
          ).id,
          contractId,
        );
        assert.equal(
          (await upload("<script>no</script>", "falso.pdf")).status,
          400,
        );
        const file = await send(`/contracts/${contractId}/file`);
        assert.equal(file.status, 200);
        assert.match(await file.text(), /sintético/);
        assert.match(file.headers.get("content-security-policy")!, /sandbox/);
        assert.equal(
          (await send(`/contracts/${contractId}/extract`, { method: "POST" }))
            .status,
          503,
        );
      },
    );
    await t.test(
      "cadastro pendente não gera datas; aprovação e edição recalculam sem duplicatas",
      async () => {
        const input = {
          name: "Bomba sintética",
          patrimony: "SINT-01",
          model: "",
          serial: "",
          sector: "Setor sintético",
          contractId,
          periodValue: 1,
          periodUnit: "months",
          anchorDate: "2024-01-31",
          anchorType: "Instalação",
          reviewed: false,
          notes: "",
        };
        let response = await send("/assets", {
          method: "POST",
          body: JSON.stringify(input),
        });
        assert.equal(response.status, 201);
        assetId = (await response.json()).id;
        assert.equal(
          (await (await send("/events?from=2024-02-01&to=2024-04-30")).json())
            .length,
          0,
        );
        assert.equal(
          (
            await send("/assets", {
              method: "POST",
              body: JSON.stringify(input),
            })
          ).status,
          409,
        );
        input.reviewed = true;
        for (let i = 0; i < 2; i++)
          assert.equal(
            (
              await send(`/assets/${assetId}`, {
                method: "PUT",
                body: JSON.stringify(input),
              })
            ).status,
            200,
          );
        assert.equal(
          (await (await send("/events?from=2024-02-01&to=2024-04-30")).json())
            .length,
          3,
        );
        input.periodValue = 2;
        assert.equal(
          (
            await send(`/assets/${assetId}`, {
              method: "PUT",
              body: JSON.stringify(input),
            })
          ).status,
          200,
        );
        const events = await (
          await send("/events?from=2024-02-01&to=2024-04-30")
        ).json();
        assert.deepEqual(
          events.map((event: { date: string }) => event.date),
          ["2024-03-31"],
        );
        assert.equal(
          (await send("/events?from=2024-99-01&to=2024-01-01")).status,
          400,
        );
        assert.equal(
          (
            await send("/assets", {
              method: "POST",
              body: JSON.stringify({
                ...input,
                patrimony: "SINT-02",
                anchorDate: null,
              }),
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "SDK envia arquivo, modelo e schema ao endpoint configurável; resultado mantém evidência",
      async () => {
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
            page: null,
            quote: "Bomba sintética",
          },
          model: missing,
          periodValue: {
            value: "6",
            status: "found",
            page: null,
            quote: "Preventiva semestral",
          },
          periodUnit: {
            value: "months",
            status: "found",
            page: null,
            quote: "Preventiva semestral",
          },
          anchorDate: missing,
          anchorType: {
            value: "Instalação",
            status: "found",
            page: null,
            quote: "após instalação",
          },
          validFrom: missing,
          validUntil: missing,
          warnings: ["Data de instalação ausente."],
        };
        let received: Record<string, any> | undefined;
        const mock = createServer(async (req, res) => {
          assert.equal(req.url, "/v1/responses");
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          received = JSON.parse(Buffer.concat(chunks).toString());
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              id: "resp_local_test",
              object: "response",
              created_at: 1,
              status: "completed",
              model: "test-model",
              output: [
                {
                  type: "message",
                  id: "msg_local",
                  role: "assistant",
                  status: "completed",
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
          );
        }).listen(0, "127.0.0.1");
        await once(mock, "listening");
        process.env.OPENAI_API_KEY = "test-not-a-real-key";
        process.env.OPENAI_MODEL = "test-model";
        process.env.OPENAI_BASE_URL = `http://127.0.0.1:${(mock.address() as AddressInfo).port}/v1`;
        try {
          const response = await send(`/contracts/${contractId}/extract`, {
            method: "POST",
          });
          assert.equal(response.status, 200);
          const result = await response.json();
          assert.deepEqual(result.extraction, extraction);
          assert.equal(received!.model, "test-model");
          assert.equal(received!.store, false);
          assert.equal(received!.text.format.type, "json_schema");
          assert.equal(received!.input[0].content[0].type, "input_file");
          assert.match(
            received!.input[0].content[0].file_data,
            /^data:text\/plain;base64,/,
          );
        } finally {
          await new Promise<void>((resolve) => mock.close(() => resolve()));
        }
      },
    );
    await t.test(
      "banco e arquivo sobrevivem ao reinício; sessão não sobrevive",
      async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
        running.store.close();
        running = createApp({
          database: join(directory, "test.sqlite"),
          password: "test-password",
        });
        server = running.app.listen(0, "127.0.0.1");
        await once(server, "listening");
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
        assert.equal((await send("/assets")).status, 401);
        const login = await send("/login", {
          method: "POST",
          body: JSON.stringify({ password: "test-password" }),
        });
        cookie = login.headers.get("set-cookie")!.split(";")[0];
        const assets = await (await send("/assets")).json();
        assert.equal(assets.length, 1);
        assert.equal(assets[0].id, assetId);
        assert.equal(assets[0].periodValue, 2);
        assert.equal((await send(`/contracts/${contractId}/file`)).status, 200);
        assert.equal(
          (await (await send(`/contracts/${contractId}`)).json()).extraction
            .periodValue.value,
          "6",
        );
      },
    );
  } finally {
    for (const [key, value] of Object.entries({
      OPENAI_API_KEY: oldKey,
      OPENAI_BASE_URL: oldUrl,
      OPENAI_MODEL: oldModel,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
    running.store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
