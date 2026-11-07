import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assetInput, prepareAsset } from "../server/domain.js";
import { createStore } from "../server/store.js";
import {
  draftFromAsset,
  draftFromExtraction,
  extractionItems,
} from "../src/contract-extraction.js";
import { brandAndModel } from "../src/equipment-identity.js";
import { groupContracts } from "../src/contract-groups.js";
import type { EquipmentExtraction, Evidence } from "../src/types.js";

const missing: Evidence = {
  value: null,
  status: "missing",
  quote: null,
  page: null,
};
const input = () =>
  assetInput.parse({
    name: "Monitor sintético",
    brand: " Marca sintética ",
    model: "Modelo sintético",
    patrimony: "SINT-BRAND",
    sector: "UTI sintética",
    contractId: null,
    periodValue: null,
    periodUnit: "months",
    anchorDate: null,
    anchorType: "",
    reviewed: false,
  });

test("marca e modelo persistem separados; edição por cliente antigo não apaga a marca", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-brand-"));
  let store = createStore(join(directory, "test.sqlite"));
  try {
    const created = prepareAsset(undefined, input());
    store.saveAsset(created);
    store.close();
    store = createStore(join(directory, "test.sqlite"));
    const saved = store.listAssets()[0];
    assert.equal(saved.brand, "Marca sintética");
    assert.equal(saved.model, "Modelo sintético");
    assert.equal(draftFromAsset(saved).brand, "Marca sintética");
    const { brand: _brand, ...oldClient } = saved;
    const updated = prepareAsset(
      saved,
      assetInput.parse({ ...oldClient, sector: "Enfermaria sintética" }),
    );
    assert.equal(updated.brand, "Marca sintética");
    store.saveAsset(updated);
    assert.equal(store.listAssets()[0].brand, "Marca sintética");
    const cleared = prepareAsset(
      updated,
      assetInput.parse({ ...updated, brand: "" }),
    );
    assert.equal(cleared.brand, "");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("ativo legado sem marca permanece acessível sem inventar fabricante ou alterar modelo", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-brand-legacy-"));
  const file = join(directory, "test.sqlite");
  let store = createStore(file);
  try {
    const created = prepareAsset(undefined, input());
    store.saveAsset(created);
    store.close();
    const db = new DatabaseSync(file);
    try {
      const row = db
        .prepare("SELECT payload FROM assets WHERE id=?")
        .get(created.id) as { payload: string };
      const payload = JSON.parse(row.payload);
      delete payload.brand;
      db.prepare("UPDATE assets SET payload=? WHERE id=?").run(
        JSON.stringify(payload),
        created.id,
      );
    } finally {
      db.close();
    }
    store = createStore(file);
    const saved = store.listAssets()[0];
    assert.equal(saved.brand, "");
    assert.equal(saved.model, "Modelo sintético");
    assert.equal(draftFromAsset(saved).brand, "");
    assert.equal(brandAndModel(saved), "Modelo sintético");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("extrações antigas, ausência e conflito não deduzem marca pelo modelo", () => {
  const old = {
    equipment: {
      ...missing,
      status: "found" as const,
      value: "Bomba sintética",
    },
    model: { ...missing, status: "found" as const, value: "Modelo ABC" },
    periodValue: missing,
    periodUnit: missing,
    anchorDate: missing,
    anchorType: missing,
    warnings: [],
  };
  const legacy = extractionItems(old)[0];
  assert.equal(draftFromExtraction(legacy, "legacy").brand, "");
  const priorV2 = { ...legacy };
  delete priorV2.brand;
  assert.equal(
    extractionItems({ version: 2, equipments: [priorV2], warnings: [] })[0]
      .brand?.status,
    "missing",
  );
  const conflicted: EquipmentExtraction = {
    ...legacy,
    brand: { ...missing, status: "conflict", quote: "Marca A ou B" },
  };
  assert.equal(draftFromExtraction(conflicted, "conflict").brand, "");
  assert.equal(assetInput.safeParse({ ...input(), brand: 123 }).success, false);
  assert.equal(
    assetInput.safeParse({ ...input(), brand: "x".repeat(161) }).success,
    false,
  );
});

test("consulta de contrato encontra equipamentos pela marca e mantém a identificação compacta", () => {
  const contract = {
    id: "sintetico",
    name: "Contrato sintético",
    mime: "text/plain",
    createdAt: "2026-11-07T00:00:00Z",
  };
  const asset = {
    ...prepareAsset(undefined, input()),
    contractId: contract.id,
  };
  assert.equal(
    groupContracts([contract], [asset], "marca sintética").length,
    1,
  );
  assert.equal(
    groupContracts([contract], [asset], "modelo sintético").length,
    1,
  );
  assert.equal(brandAndModel(asset), "Marca sintética · Modelo sintético");
});
