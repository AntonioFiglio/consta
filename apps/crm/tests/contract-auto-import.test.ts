import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createStore } from "../server/store.js";
import { importContractEquipment } from "../server/contract-import.js";
import { assetInput, eventsFor, prepareAsset } from "../server/domain.js";
import { documented, importBatch, importEquipment } from "./fixtures/import-equipment.js";

test("importação cadastra seis fichas, vínculos e contatos sem aprovação automática do plano", () => {
  const store = createStore(":memory:");
  try {
    const tc = store.upload("tc.txt", "text/plain", Buffer.from("TC sintético"));
    const result = importContractEquipment(store, tc.id, importBatch());
    assert.equal(result.createdCount, 6);
    assert.equal(result.assets.length, 6);
    assert.equal(store.listAssets().length, 6);
    assert.equal(result.contract.extraction && "equipments" in result.contract.extraction && result.contract.extraction.equipments.length, 6);
    for (const asset of result.assets) {
      assert.equal(asset.contractId, tc.id);
      assert.equal(asset.brand, "Marca sintética");
      assert.equal(asset.model, "Modelo sintético");
      assert.equal(asset.sector, "Setor de teste");
      assert.equal(asset.maintenanceCompany, "Assistência sintética");
      assert.equal(asset.maintenancePhone, "(11) 5555-0123");
      assert.equal(asset.maintenanceEmail, "assistencia@example.test");
      assert.equal(asset.patrimony, "");
      assert.equal(asset.serial, "");
      assert.equal(asset.coverages![0].reviewed, false);
      assert.equal(asset.periodValue, 6);
      assert.equal(asset.firstDueDate, "2026-07-10");
    }
    assert.equal(eventsFor(result.assets, "2026-01-01", "2026-12-31").length, 0);
  } finally { store.close(); }
});

test("reenvio reutiliza a leitura salva, preserva correções e mantém os mesmos seis IDs após reinício", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-auto-import-"));
  const path = join(dir, "db.sqlite");
  let store = createStore(path);
  try {
    const tc = store.upload("tc.txt", "text/plain", Buffer.from("TC sintético"));
    const first = importContractEquipment(store, tc.id, importBatch());
    const target = first.assets[0];
    store.saveAsset(prepareAsset(target, assetInput.parse({ ...target, patrimony: "TOMB-CONFIRMADO", brand: "Marca corrigida", reviewed: true })));
    store.close(); store = createStore(path);
    const again = importContractEquipment(store, tc.id);
    assert.equal(again.createdCount, 0);
    assert.equal(again.existingCount, 6);
    assert.deepEqual(again.assets.map(item => item.id), first.assets.map(item => item.id));
    assert.equal(again.assets[0].patrimony, "TOMB-CONFIRMADO");
    assert.equal(again.assets[0].brand, "Marca corrigida");
    assert.equal(again.assets[0].reviewed, true);
    assert.equal(store.listAssets().length, 6);
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test("lote inválido não grava parte das fichas nem altera a extração anterior", () => {
  const store = createStore(":memory:");
  try {
    const tc = store.upload("tc.txt", "text/plain", Buffer.from("TC sintético"));
    const duplicate = importEquipment({ quantity: documented("1"), patrimony: documented("MESMO-TOMBAMENTO") });
    assert.throws(() => importContractEquipment(store, tc.id, importBatch([duplicate, duplicate])));
    assert.equal(store.listAssets().length, 0);
    assert.equal(store.getContract(tc.id)!.extraction, null);
    assert.equal(store.listContracts().length, 1);
  } finally { store.close(); }
});

test("ausência de leitura ou de equipamentos não comunica sucesso nem cria ficha fictícia", () => {
  const store = createStore(":memory:");
  try {
    const tc = store.upload("tc.txt", "text/plain", Buffer.from("TC sintético"));
    assert.throws(() => importContractEquipment(store, tc.id), /precisa ser lido/);
    assert.throws(() => importContractEquipment(store, tc.id, importBatch([])), /nenhum equipamento/);
    assert.equal(store.listAssets().length, 0);
  } finally { store.close(); }
});

test("contrato de manutenção e aditivo não cadastram novas máquinas pelo fluxo do TC", () => {
  const store = createStore(":memory:");
  try {
    const main = store.upload("tc.txt", "text/plain", Buffer.from("TC"));
    const child = store.upload("manutencao.txt", "text/plain", Buffer.from("Manutenção"));
    store.setContractParent(child.id, main.id, "outsourced");
    assert.throws(() => importContractEquipment(store, child.id, importBatch()), /principal/);
    assert.equal(store.listAssets().length, 0);
  } finally { store.close(); }
});
