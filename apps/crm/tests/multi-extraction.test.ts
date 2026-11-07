import { test } from "node:test";
import assert from "node:assert/strict";
import type {
  Evidence,
  EquipmentExtraction,
  MultiEquipmentExtraction,
} from "../src/types.js";
import {
  draftFromExtraction,
  evidenceDate,
  extractionItems,
  existingForDraft,
} from "../src/contract-extraction.js";
import { assetInput, eventsFor, prepareAsset } from "../server/domain.js";
import { createStore } from "../server/store.js";
import { nextMaintenanceDate } from "../src/schedule.js";
import { extractionSchema } from "../server/extraction.js";
const missing: Evidence = {
  value: null,
  status: "missing",
  page: null,
  quote: null,
};
const found = (value: string, page = 1): Evidence => ({
  value,
  status: "found",
  page,
  quote: value,
});
function item(patch: Partial<EquipmentExtraction> = {}): EquipmentExtraction {
  return {
    equipment: found("Bomba sintética"),
    patrimony: found("SINT-01"),
    serial: found("SERIE-01"),
    model: found("Modelo A"),
    sector: found("UTI sintética"),
    notes: found("Inspecionar conexões"),
    quantity: found("1"),
    periodValue: found("6"),
    periodUnit: found("months"),
    firstDueDate: missing,
    anchorDate: found("2026-01-31"),
    anchorType: found("Instalação"),
    validFrom: found("2026-01-01"),
    validUntil: found("2026-12-31"),
    warnings: [],
    ...patch,
  };
}
test("schema e preenchimento mantêm todos os equipamentos, identidades e regras independentes", () => {
  const source: MultiEquipmentExtraction = {
    version: 2,
    equipments: [
      item(),
      item({
        equipment: found("Monitor sintético", 3),
        patrimony: found("SINT-02", 3),
        serial: found("SERIE-02", 3),
        sector: found("Enfermaria sintética", 3),
        model: found("Modelo B", 3),
        periodValue: found("3", 3),
        anchorDate: found("2026-02-10", 3),
        firstDueDate: found("2026-05-10", 3),
      }),
    ],
    warnings: [],
  };
  assert.equal(extractionSchema.safeParse(source).success, true);
  const drafts = extractionItems(source).map((value, index) =>
    draftFromExtraction(value, `draft-${index}`),
  );
  assert.equal(drafts.length, 2);
  assert.deepEqual(
    drafts.map((row) => [
      row.name,
      row.patrimony,
      row.serial,
      row.model,
      row.sector,
      row.periodValue,
      row.firstDueDate,
    ]),
    [
      [
        "Bomba sintética",
        "SINT-01",
        "SERIE-01",
        "Modelo A",
        "UTI sintética",
        "6",
        "2026-07-31",
      ],
      [
        "Monitor sintético",
        "SINT-02",
        "SERIE-02",
        "Modelo B",
        "Enfermaria sintética",
        "3",
        "2026-05-10",
      ],
    ],
  );
  assert.equal(drafts[1].evidence?.equipment.page, 3);
  const store = createStore(":memory:");
  try {
    const contract = store.upload(
      "contrato-sintetico.txt",
      "text/plain",
      Buffer.from("dois equipamentos sintéticos"),
    );
    store.saveAssets(
      drafts.map((row) =>
        prepareAsset(
          undefined,
          assetInput.parse({
            ...row,
            contractId: contract.id,
            periodValue: Number(row.periodValue),
            reviewed: true,
          }),
        ),
      ),
    );
    const saved = store.listAssets();
    assert.equal(saved.length, 2);
    assert.equal(saved[0].serial, "SERIE-01");
    assert.equal(saved[1].serial, "SERIE-02");
    const events = eventsFor(saved, "2026-01-01", "2026-12-31");
    assert.deepEqual(
      events
        .filter((event) => event.patrimony === "SINT-01")
        .map((event) => event.date),
      ["2026-07-31"],
    );
    assert.deepEqual(
      events
        .filter((event) => event.patrimony === "SINT-02")
        .map((event) => event.date),
      ["2026-05-10", "2026-08-10", "2026-11-10"],
    );
    assert.equal(nextMaintenanceDate(saved[0], "2026-01-01"), "2026-07-31");
    assert.equal(nextMaintenanceDate(saved[1], "2026-06-01"), "2026-08-10");
    assert.equal(nextMaintenanceDate(saved[1], "2027-01-01"), null);
    assert.equal(existingForDraft(drafts[1], saved)?.id, saved[1].id);
  } finally {
    store.close();
  }
});
test("quantidade sem identificação não inventa patrimônios nem replica unidades automaticamente", () => {
  const group = item({
    patrimony: missing,
    serial: missing,
    quantity: found("10"),
    anchorDate: missing,
    anchorType: missing,
    periodValue: {
      ...missing,
      status: "conflict",
      quote: "trimestral versus semestral",
    },
  });
  const source: MultiEquipmentExtraction = {
    version: 2,
    equipments: [group],
    warnings: [],
  };
  const rows = extractionItems(source).map((value) =>
    draftFromExtraction(value, "group"),
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].quantity, "10");
  assert.equal(rows[0].patrimony, "");
  assert.equal(rows[0].serial, "");
  assert.equal(rows[0].periodValue, "");
  assert.equal(rows[0].firstDueDate, "");
});
test("dados antigos continuam legíveis; datas inválidas e equipamento ausente não viram preenchimento fictício", () => {
  const old = {
    equipment: found("Legado sintético"),
    model: missing,
    periodValue: missing,
    periodUnit: missing,
    anchorDate: missing,
    anchorType: missing,
    warnings: [],
  };
  const rows = extractionItems(old);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].equipment.value, "Legado sintético");
  assert.equal(rows[0].patrimony.status, "missing");
  assert.equal(evidenceDate(found("2026-02-30")), "");
  assert.equal(evidenceDate(found("2026-13-01")), "");
  assert.equal(evidenceDate(found("2024-02-29")), "2024-02-29");
  assert.deepEqual(
    extractionItems({
      version: 2,
      equipments: [],
      warnings: ["Documento sem equipamentos."],
    }),
    [],
  );
});
