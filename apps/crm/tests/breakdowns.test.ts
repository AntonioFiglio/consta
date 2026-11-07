import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../server/store.js";
import { assetInput, eventsFor, prepareAsset } from "../server/domain.js";
import { breakdownInput, updateBreakdown } from "../server/breakdowns.js";
import { activeBreakdown } from "../src/breakdowns.js";

const input = () =>
  assetInput.parse({
    name: "Monitor sintético",
    brand: "Teste",
    patrimony: "QUEBRA-01",
    contractId: null,
    periodValue: 1,
    periodUnit: "months",
    anchorDate: null,
    firstDueDate: "2026-11-10",
    anchorType: "Primeira manutenção",
    reviewed: true,
  });
const original = () => prepareAsset(undefined, input());

test("quebra sem agendamento mantém preventivas e não cria data fictícia", () => {
  const asset = original();
  const preventive = eventsFor([asset], "2026-11-01", "2026-12-31");
  const broken = updateBreakdown(
    asset,
    { action: "report", scheduledDate: null },
    "2026-11-07T12:00:00Z",
  );
  assert.equal(activeBreakdown(broken)?.scheduledDate, null);
  assert.deepEqual(broken.coverages, asset.coverages);
  assert.deepEqual(eventsFor([broken], "2026-11-01", "2026-12-31"), preventive);
  assert.throws(
    () => updateBreakdown(broken, { action: "report", scheduledDate: null }),
    /já está marcado/,
  );
  assert.equal(broken.breakdowns!.length, 1);
});

test("reparo agendado independe de plano, distingue-se da preventiva e não duplica ao reagendar", () => {
  const asset = original();
  const broken = updateBreakdown(asset, {
    action: "report",
    scheduledDate: "2026-11-10",
  });
  const events = eventsFor([broken], "2026-11-10", "2026-11-10");
  assert.equal(events.length, 2);
  assert.equal(events[0].kind, "corrective");
  assert.notEqual(events[0].id, events[1].id);
  assert.deepEqual(eventsFor([broken], "2026-11-10", "2026-11-10"), events);
  const changed = updateBreakdown(broken, {
    action: "schedule",
    scheduledDate: "2026-11-15",
  });
  assert.equal(changed.breakdowns!.length, 1);
  assert.equal(activeBreakdown(changed)!.id, activeBreakdown(broken)!.id);
  assert.equal(eventsFor([changed], "2026-11-10", "2026-11-10").length, 1);
  assert.equal(
    eventsFor([changed], "2026-11-15", "2026-11-15")[0].kind,
    "corrective",
  );
  const noPlan = {
    ...changed,
    coverages: [],
    reviewed: false,
    periodValue: null,
    firstDueDate: null,
  };
  assert.equal(eventsFor([noPlan], "2026-11-15", "2026-11-15").length, 1);
  const unscheduled = updateBreakdown(changed, {
    action: "schedule",
    scheduledDate: null,
  });
  assert.equal(eventsFor([unscheduled], "2026-11-15", "2026-11-15").length, 0);
});

test("reparo encerra a flag e o evento ativo, preservando histórico entre ocorrências e reinícios", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-breakdown-"));
  const database = join(directory, "test.sqlite");
  let store = createStore(database);
  try {
    store.saveAsset(original());
    const asset = store.listAssets()[0];
    const broken = store.saveAsset(
      updateBreakdown(asset, { action: "report", scheduledDate: "2026-11-12" }),
    );
    const edited = store.saveAsset(
      prepareAsset(
        broken,
        assetInput.parse({ ...broken, model: "Modelo atualizado" }),
      ),
    );
    assert.deepEqual(edited.breakdowns, broken.breakdowns);
    const resolved = store.saveAsset(
      updateBreakdown(edited, { action: "resolve" }, "2026-11-12T15:00:00Z"),
    );
    assert.equal(activeBreakdown(resolved), undefined);
    assert.equal(eventsFor([resolved], "2026-11-12", "2026-11-12").length, 0);
    const again = store.saveAsset(
      updateBreakdown(resolved, { action: "report", scheduledDate: null }),
    );
    assert.equal(again.breakdowns!.length, 2);
    assert.notEqual(again.breakdowns![0].id, again.breakdowns![1].id);
    assert.equal(again.breakdowns![1].resolvedAt, "2026-11-12T15:00:00Z");
    store.close();
    store = createStore(database);
    assert.deepEqual(store.listAssets()[0].breakdowns, again.breakdowns);
    assert.deepEqual(store.listAssets()[0].coverages, asset.coverages);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("valida data real, ações e payload sem aceitar alterações de cadastro", () => {
  for (const date of ["2026-02-30", "10/11/2026", "", "1800-01-01"]) {
    assert.throws(() =>
      breakdownInput.parse({ action: "schedule", scheduledDate: date }),
    );
  }
  assert.throws(() =>
    breakdownInput.parse({ action: "report", reviewed: true }),
  );
  assert.throws(() =>
    breakdownInput.parse({ action: "resolve", scheduledDate: "2026-11-10" }),
  );
  assert.throws(
    () => updateBreakdown(original(), { action: "resolve" }),
    /não está marcado/,
  );
  assert.throws(
    () =>
      updateBreakdown(original(), {
        action: "schedule",
        scheduledDate: "2026-11-10",
      }),
    /não está marcado/,
  );
});

test("lista, ficha e calendário concordam durante registro, reagendamento e reparo", async () => {
  const { equipmentSituation, matchesEquipmentFilter } =
    await import("../src/equipment-situation.js");
  const { repairStatus, syncRepairEvent } =
    await import("../src/breakdowns.js");
  const base = original();
  const initialFilter = equipmentSituation(base, "2026-11-07").kind;
  const from = "2026-11-01",
    to = "2026-11-30";
  const preventive = eventsFor([base], from, to);
  const broken = updateBreakdown(base, {
    action: "report",
    scheduledDate: null,
  });
  assert.equal(equipmentSituation(broken, "2026-11-07").kind, "broken");
  assert.equal(matchesEquipmentFilter(broken, "broken", "2026-11-07"), true);
  assert.equal(
    matchesEquipmentFilter(broken, initialFilter, "2026-11-07"),
    false,
  );
  assert.equal(repairStatus(broken, "2026-11-07")?.stage, "unscheduled");
  assert.deepEqual(
    syncRepairEvent(preventive, broken, from, to),
    eventsFor([broken], from, to),
  );
  const scheduled = updateBreakdown(broken, {
    action: "schedule",
    scheduledDate: "2026-11-10",
  });
  const cache = syncRepairEvent(preventive, scheduled, from, to);
  assert.deepEqual(cache, eventsFor([scheduled], from, to));
  assert.equal(repairStatus(scheduled, "2026-11-10")?.stage, "scheduled");
  assert.equal(repairStatus(scheduled, "2026-11-11")?.stage, "overdue");
  const rescheduled = updateBreakdown(scheduled, {
    action: "schedule",
    scheduledDate: "2026-11-12",
  });
  const moved = syncRepairEvent(cache, rescheduled, from, to);
  assert.equal(moved.filter((event) => event.kind === "corrective").length, 1);
  assert.equal(
    moved.find((event) => event.kind === "corrective")?.date,
    "2026-11-12",
  );
  assert.deepEqual(moved, eventsFor([rescheduled], from, to));
  const resolved = updateBreakdown(rescheduled, { action: "resolve" });
  assert.equal(equipmentSituation(resolved, "2026-11-07").kind, initialFilter);
  assert.equal(matchesEquipmentFilter(resolved, "broken", "2026-11-07"), false);
  assert.deepEqual(syncRepairEvent(moved, resolved, from, to), preventive);
  assert.equal(resolved.breakdowns!.length, 1);
});

test("atualização imediata de reparo preserva as preventivas e os reparos de outras unidades", async () => {
  const { syncRepairEvent } = await import("../src/breakdowns.js");
  const first = updateBreakdown(original(), {
    action: "report",
    scheduledDate: "2026-11-10",
  });
  const other = updateBreakdown(
    { ...original(), id: "outro", patrimony: "OUTRO" },
    { action: "report", scheduledDate: "2026-11-12" },
  );
  const from = "2026-11-01",
    to = "2026-11-30";
  const cache = eventsFor([first, other], from, to);
  const outOfMonth = updateBreakdown(first, {
    action: "schedule",
    scheduledDate: "2026-12-10",
  });
  const updated = syncRepairEvent(cache, outOfMonth, from, to);
  assert.equal(
    updated.filter((event) => event.kind === "corrective").length,
    1,
  );
  assert.equal(
    updated.find((event) => event.kind === "corrective")?.assetId,
    other.id,
  );
  assert.deepEqual(
    updated.filter((event) => event.kind !== "corrective"),
    cache.filter((event) => event.kind !== "corrective"),
  );
  assert.equal(cache.filter((event) => event.kind === "corrective").length, 2);
});
