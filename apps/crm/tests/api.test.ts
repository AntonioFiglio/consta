import { importBatch } from "./fixtures/import-equipment.js";
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
        assert.equal(
          (
            await send("/assets/nao-existe/maintenance-responsibility", {
              method: "PATCH",
              body: JSON.stringify({ maintenanceProvider: "internal" }),
            })
          ).status,
          401,
        );
        assert.equal((await send("/contracts")).status, 401);
        assert.equal((await send("/contracts/nao-existe/summary", { method: "POST", body: "{}" })).status, 401);
        assert.equal(
          (
            await send("/contracts/nao-existe/parent", {
              method: "PATCH",
              body: JSON.stringify({ parentContractId: null }),
            })
          ).status,
          401,
        );
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
        const contractList = await send("/contracts");
        assert.equal(contractList.status, 200);
        const summaries = await contractList.json();
        assert.ok(
          summaries.some((item: { id: string }) => item.id === contractId),
        );
        assert.ok(
          summaries.every(
            (item: object) => !("extraction" in item) && !("bytes" in item),
          ),
        );
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
    await t.test("resumo sem IA exige sessão e reutiliza simulação persistida", async () => {
      const requests = await Promise.all([send(`/contracts/${contractId}/summary`, { method: "POST", body: "{}" }), send(`/contracts/${contractId}/summary`, { method: "POST", body: "{}" })]);
      assert.ok(requests.every(response => response.status === 200));
      const [first, second] = await Promise.all(requests.map(response => response.json()));
      assert.equal(first.source, "simulated");
      assert.match(first.overview, /Lorem ipsum/);
      assert.deepEqual(first, second);
      assert.equal((await send(`/contracts/${contractId}/summary`, { method: "POST", body: JSON.stringify({ retry: "yes" }) })).status, 400);
    });
    await t.test(
      "organiza aditivos sem alterar arquivo ou cobertura",
      async () => {
        const body = new FormData();
        body.append(
          "file",
          new Blob(["Aditivo sintético de verificação"]),
          "aditivo-sintetico.txt",
        );
        const uploaded = await send("/contracts", { method: "POST", body });
        assert.equal(uploaded.status, 201);
        const child = await uploaded.json();
        const linked = await send(`/contracts/${child.id}/parent`, {
          method: "PATCH",
          body: JSON.stringify({ parentContractId: contractId }),
        });
        assert.equal(linked.status, 200);
        const summary = await linked.json();
        assert.equal(summary.parentContractId, contractId);
        assert.equal("extraction" in summary, false);
        assert.equal(
          await (await send(`/contracts/${child.id}/file`)).text(),
          "Aditivo sintético de verificação",
        );
        assert.equal(
          (
            await send(`/contracts/${contractId}/parent`, {
              method: "PATCH",
              body: JSON.stringify({ parentContractId: child.id }),
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await send(`/contracts/${child.id}/parent`, {
              method: "PATCH",
              body: JSON.stringify({ parentContractId: "invalid" }),
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await send("/contracts/nao-existe/parent", {
              method: "PATCH",
              body: JSON.stringify({ parentContractId: null }),
            })
          ).status,
          404,
        );
        assert.equal(
          (
            await send(`/contracts/${child.id}/parent`, {
              method: "PATCH",
              body: JSON.stringify({ parentContractId: null }),
            })
          ).status,
          200,
        );
      },
    );
    await t.test(
      "cadastro pendente não gera datas; aprovação e edição recalculam sem duplicatas",
      async () => {
        const input = {
          name: "Bomba sintética",
          brand: "Marca sintética API",
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
        const created = await response.json();
        assetId = created.id;
        assert.equal(created.brand, "Marca sintética API");
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
      "definição interna não modifica contrato, planejamento ou calendário",
      async () => {
        const before = (await (await send("/assets")).json()).find(
          (asset: { id: string }) => asset.id === assetId,
        );
        const response = await send(
          `/assets/${assetId}/maintenance-responsibility`,
          {
            method: "PATCH",
            body: JSON.stringify({ maintenanceProvider: "internal" }),
          },
        );
        assert.equal(response.status, 200);
        const updated = await response.json();
        assert.equal(updated.maintenanceProvider, "internal");
        assert.deepEqual(updated.coverages, before.coverages);
        assert.equal(updated.contractId, before.contractId);
        assert.equal(updated.reviewed, before.reviewed);
        assert.equal(
          (
            await send(`/assets/${assetId}/maintenance-responsibility`, {
              method: "PATCH",
              body: JSON.stringify({ maintenanceProvider: "invalid" }),
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await send(`/assets/${assetId}/maintenance-responsibility`, {
              method: "PATCH",
              body: JSON.stringify({
                maintenanceProvider: "contract",
                reviewed: true,
              }),
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await send("/assets/nao-existe/maintenance-responsibility", {
              method: "PATCH",
              body: JSON.stringify({ maintenanceProvider: "internal" }),
            })
          ).status,
          404,
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
        const equipment = {
          equipment: {
            value: "Bomba sintética",
            status: "found",
            page: null,
            quote: "Bomba sintética",
          },
          brand: missing,
          maintenanceCompany: missing,
          maintenancePhone: missing,
          maintenanceEmail: missing,
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
        const extraction: Extraction = {
          version: 2,
          equipments: [
            {
              ...equipment,
              equipment: { ...equipment.equipment, status: "found" },
              periodValue: { ...equipment.periodValue, status: "found" },
              periodUnit: { ...equipment.periodUnit, status: "found" },
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
              output: [{
                  type: "function_call",
                  id: "fc_test",
                  call_id: "call_test",
                  status: "completed",
                  name: "prepare_equipment_import",
                  arguments: JSON.stringify(extraction),
                }],
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
          assert.deepEqual({ ...result.extraction, equipments: result.extraction.equipments.map(({ importUnit: _unit, ...fields }: any) => fields) }, extraction);
          assert.equal(received!.model, "test-model");
          assert.equal(received!.store, false);
          assert.equal(received!.tools[0].name, "prepare_equipment_import");
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
    await t.test("importação em lote sem tombamento é idempotente e permite completar identificação", async () => {
      const payload = Array.from({ length: 6 }, (_, index) => ({
        name: "Ecocardiógrafo sintético", patrimony: "", serial: "", contractId,
        importSource: { contractId, unitKey: `synthetic-group:${index}`, position: index + 1, total: 6 },
        periodValue: null, periodUnit: "months", anchorDate: null, reviewed: false,
      }));
      const first = await send("/assets/batch", { method: "POST", body: JSON.stringify({ assets: payload }) });
      assert.equal(first.status, 201);
      const units = await first.json();
      assert.equal(units.length, 6);
      const second = await send("/assets/batch", { method: "POST", body: JSON.stringify({ assets: payload }) });
      assert.equal(second.status, 201);
      assert.deepEqual((await second.json()).map((unit: any) => unit.id), units.map((unit: any) => unit.id));
      const filled = await send(`/assets/${units[0].id}`, { method: "PUT", body: JSON.stringify({ ...units[0], patrimony: "TOMB-LOTE-01" }) });
      assert.equal(filled.status, 200);
      const all = await (await send("/assets")).json();
      assert.equal(all.filter((unit: any) => unit.importSource?.unitKey?.startsWith("synthetic-group:")).length, 6);
    });
    await t.test("TC com leitura persistida cadastra equipamentos sem nova chamada à IA", async () => {
      const tc = running.store.upload("tc-auto.txt", "text/plain", Buffer.from("TC automático sintético"));
      running.store.saveExtraction(tc.id, importBatch());
      const key = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      try {
        const response = await send(`/contracts/${tc.id}/import`, { method: "POST" });
        assert.equal(response.status, 200);
        const imported = await response.json();
        assert.equal(imported.createdCount, 6);
        assert.equal(imported.assets.length, 6);
        assert.ok(imported.assets.every((asset: any) => asset.contractId === tc.id && asset.reviewed === false));
        const repeat = await (await send(`/contracts/${tc.id}/import`, { method: "POST" })).json();
        assert.equal(repeat.createdCount, 0);
        assert.deepEqual(repeat.assets.map((asset: any) => asset.id), imported.assets.map((asset: any) => asset.id));
        const all = await (await send("/assets")).json();
        assert.equal(all.filter((asset: any) => asset.contractId === tc.id).length, 6);
      } finally {
        if (key === undefined) delete process.env.OPENAI_API_KEY;
        else process.env.OPENAI_API_KEY = key;
      }
    });
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
