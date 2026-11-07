import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assetInput,
  eventsFor,
  occurrence,
  validDate,
} from "../server/domain.js";
import type { Asset } from "../src/types.js";

const asset: Asset = {
  id: "test-asset",
  name: "Bomba sintética",
  brand: "",
  model: "",
  patrimony: "TEST-1",
  serial: "",
  sector: "",
  contractId: null,
  periodValue: 1,
  periodUnit: "months",
  anchorDate: "2024-01-31",
  anchorType: "Instalação",
  reviewed: true,
  notes: "",
  simulated: true,
  updatedAt: "2024-01-01T00:00:00Z",
};

test("ciclos mensais preservam o marco original em fim de mês e ano bissexto", () => {
  assert.equal(occurrence("2024-01-31", 1, "months", 1), "2024-02-29");
  assert.equal(occurrence("2024-01-31", 1, "months", 2), "2024-03-31");
  assert.equal(occurrence("2023-01-31", 1, "months", 1), "2023-02-28");
  assert.equal(occurrence("2024-02-29", 1, "years", 1), "2025-02-28");
  assert.equal(occurrence("2024-02-29", 1, "years", 4), "2028-02-29");
  assert.equal(occurrence("2024-02-28", 2, "days", 1), "2024-03-01");
});
test("projeção exige revisão, periodicidade e marco; edição substitui previsões sem duplicar", () => {
  const dates = eventsFor([asset], "2024-02-01", "2024-04-30");
  assert.deepEqual(
    dates.map((event) => event.date),
    ["2024-02-29", "2024-03-31", "2024-04-30"],
  );
  assert.deepEqual(eventsFor([asset], "2024-02-01", "2024-04-30"), dates);
  for (const patch of [
    { reviewed: false },
    { periodValue: null },
    { anchorDate: null },
  ])
    assert.equal(
      eventsFor([{ ...asset, ...patch }], "2024-02-01", "2024-04-30").length,
      0,
    );
  assert.deepEqual(
    eventsFor([{ ...asset, periodValue: 2 }], "2024-02-01", "2024-04-30").map(
      (event) => event.date,
    ),
    ["2024-03-31"],
  );
  assert.equal(dates[0].simulated, true);
});
test("validação rejeita datas inexistentes, aprovação incompleta e intervalos inválidos", () => {
  for (const date of [
    "2024-13-01",
    "2024-02-30",
    "2023-02-29",
    "nada",
    "",
    "2024-00-00",
  ])
    assert.equal(validDate(date), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(assetInput.safeParse(asset).success, true);
  for (const patch of [
    { periodValue: 0 },
    { periodValue: 1.5 },
    { anchorDate: null },
    { anchorDate: "2024-13-01" },
    { anchorType: "" },
  ])
    assert.equal(assetInput.safeParse({ ...asset, ...patch }).success, false);
  assert.equal(
    assetInput.safeParse({
      ...asset,
      reviewed: false,
      anchorDate: null,
      periodValue: null,
    }).success,
    true,
  );
});
