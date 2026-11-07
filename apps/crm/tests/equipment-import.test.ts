import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import { equipmentExtractionSchema, prepareEquipmentImport, extractContract } from "../server/extraction.js";
import { assetInput, prepareAsset, eventsFor } from "../server/domain.js";
import { createStore } from "../server/store.js";
import { draftFromExtraction, extractionItems, existingForDraft } from "../src/contract-extraction.js";
import type { EquipmentExtraction, MultiEquipmentExtraction } from "../src/types.js";

const absent = { value: null, status: "missing" as const, page: null, quote: null };
const found = (value: string) => ({ value, status: "found" as const, page: 36, quote: value });
function group(quantity = "06"): EquipmentExtraction {
  return {
    ...Object.fromEntries(Object.keys(equipmentExtractionSchema.shape).map(key => [key, absent])),
    equipment: found("Ecocardiógrafo sintético"), brand: found("Marca demonstrativa"),
    model: found("Modelo X"), quantity: { ...found(quantity), quote: `ULTRASSOM DIAGNÓSTICO — ${quantity}` },
    warnings: [],
  } as EquipmentExtraction;
}
const batch = (item = group()): MultiEquipmentExtraction => ({ version: 2, equipments: [item], warnings: [] });

test("seis unidades têm dados comuns, identidades pendentes e chaves estáveis, sem expansão repetida", () => {
  const source = batch();
  source.warnings = ["Foi retornado um item de grupo, sem criar unidades.", "Periodicidade depende do manual."];
  const prepared = prepareEquipmentImport(source);
  assert.equal(prepared.equipments.length, 6);
  assert.deepEqual(prepared.equipments.map(item => item.importUnit!.position), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(prepared.equipments.map(item => item.importUnit!.key)).size, 6);
  assert.deepEqual(extractionItems(prepared), prepared.equipments);
  assert.deepEqual(extractionItems(source), prepared.equipments);
  assert.equal(source.equipments.length, 1);
  assert.match(prepared.warnings[0], /separadas para conferência/);
  assert.equal(prepared.warnings[1], "Periodicidade depende do manual.");
  for (const item of prepared.equipments) {
    assert.deepEqual(item.quantity, source.equipments[0].quantity);
    assert.equal(item.serial.value, null);
    assert.equal(item.patrimony.value, null);
    assert.equal(item.brand?.value, "Marca demonstrativa");
  }
});

test("limites não truncam lotes; conflito ou identificador individual não replica máquinas", () => {
  assert.throws(() => prepareEquipmentImport(batch(group("51"))), /50 equipamentos/);
  assert.throws(() => prepareEquipmentImport({ version: 2, equipments: [group("30"), group("30")], warnings: [] }), /50 equipamentos/);
  assert.throws(() => prepareEquipmentImport(batch(group("0"))), /inválida/);
  assert.equal(prepareEquipmentImport(batch({ ...group(), quantity: { ...absent, status: "conflict" } })).equipments.length, 1);
  const one = prepareEquipmentImport(batch({ ...group(), serial: found("SERIE-UNICA") }));
  assert.equal(one.equipments.length, 1);
  assert.equal(one.equipments[0].serial.value, "SERIE-UNICA");
  assert.match(one.equipments[0].warnings.join(), /identificador individual/);
});

test("seis cadastros pendentes persistem, são reconhecidos no reenvio e enriquecidos sem duplicação", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-quantity-"));
  const file = join(dir, "db.sqlite");
  let store = createStore(file);
  try {
    const contract = store.upload("tc-sintetico.txt", "text/plain", Buffer.from("Seis unidades sintéticas"));
    const prepared = prepareEquipmentImport(batch());
    const assets = prepared.equipments.map(item => {
      const draft = draftFromExtraction(item, randomUUID());
      return prepareAsset(undefined, assetInput.parse({
        ...draft, importSource: { contractId: contract.id, unitKey: item.importUnit!.key },
        contractId: contract.id, periodValue: null, periodUnit: "months", anchorDate: null,
        firstDueDate: null, validFrom: null, validUntil: null, reviewed: false,
      }));
    });
    store.saveAssets(assets);
    store.close(); store = createStore(file);
    const saved = store.listAssets();
    assert.equal(saved.length, 6);
    assert.ok(saved.every(item => item.patrimony === "" && item.serial === ""));
    assert.equal(eventsFor(saved, "2026-01-01", "2026-12-31").length, 0);
    const again = extractionItems(batch()).map(item => draftFromExtraction(item, randomUUID()));
    assert.deepEqual(new Set(again.map(row => existingForDraft(row, saved, contract.id)?.id)), new Set(saved.map(item => item.id)));
    const target = existingForDraft(again[0], saved, contract.id)!;
    store.saveAsset(prepareAsset(target, assetInput.parse({ ...target, patrimony: "TOMB-SINT-01" })));
    assert.equal(store.listAssets().length, 6);
    assert.equal(store.listAssets().find(item => item.id === target.id)?.patrimony, "TOMB-SINT-01");
    assert.throws(() => store.saveAsset(prepareAsset(undefined, assetInput.parse({ ...assets[1], importSource: undefined, patrimony: "TOMB-SINT-01" }))));
    const raw = new DatabaseSync(file);
    assert.deepEqual(raw.prepare("PRAGMA foreign_key_check").all(), []);
    raw.close();
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test("SDK recebe um grupo compacto em uma única chamada de ferramenta e prepara seis unidades", async () => {
  const old = { OPENAI_API_KEY: process.env.OPENAI_API_KEY, OPENAI_BASE_URL: process.env.OPENAI_BASE_URL, OPENAI_MODEL: process.env.OPENAI_MODEL };
  process.env.OPENAI_API_KEY = "synthetic-test-key";
  process.env.OPENAI_BASE_URL = "https://synthetic.invalid/v1";
  process.env.OPENAI_MODEL = "synthetic-model";
  let requests = 0;
  let invalid = false;
  const transport = (async (_url: unknown, init?: RequestInit) => {
    requests++;
    const body = JSON.parse(String(init?.body));
    assert.equal(body.tools[0].name, "prepare_equipment_import");
    assert.equal(body.tools[0].strict, true);
    assert.equal(body.tool_choice.name, "prepare_equipment_import");
    assert.equal(body.parallel_tool_calls, false);
    return new Response(JSON.stringify({
      id: "resp_synthetic", object: "response", status: "completed", created_at: 1,
      model: "synthetic-model", output: [{ type: "function_call", id: "fc_synthetic",
        call_id: "call_synthetic", status: "completed", name: invalid ? "unapproved_action" : "prepare_equipment_import",
        arguments: JSON.stringify(batch()),
      }],
    }), { headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  try {
    const result = await extractContract(Buffer.from("TC sintético"), "tc.txt", "text/plain", transport);
    assert.equal(result.equipments.length, 6);
    assert.equal(requests, 1);
    invalid = true;
    await assert.rejects(() => extractContract(Buffer.from("TC"), "tc.txt", "text/plain", transport), /INVALID_EXTRACTION/);
  } finally {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("migração do banco com tombamento único preserva contratos e permite duas unidades pendentes", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-quantity-migration-"));
  const file = join(dir, "db.sqlite");
  const raw = new DatabaseSync(file);
  raw.exec("CREATE TABLE contracts(id TEXT PRIMARY KEY,hash TEXT UNIQUE NOT NULL,metadata TEXT NOT NULL,bytes BLOB NOT NULL); CREATE TABLE assets(id TEXT PRIMARY KEY,patrimony TEXT UNIQUE NOT NULL,payload TEXT NOT NULL,contract_id TEXT REFERENCES contracts(id)); PRAGMA user_version=5;");
  raw.close();
  const store = createStore(file);
  try {
    const contract = store.upload("tc.txt", "text/plain", Buffer.from("TC sintético"));
    const assets = ["", "", "TOMB-LEGADO"].map(patrimony => prepareAsset(undefined, assetInput.parse({
      name: "Equipamento sintético", patrimony, contractId: contract.id, periodValue: null,
      periodUnit: "months", anchorDate: null, reviewed: false,
    })));
    store.saveAssets(assets);
    assert.equal(store.listAssets().length, 3);
    assert.equal(store.listContracts().length, 1);
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});
