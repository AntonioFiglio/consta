import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { maintenanceStatus } from "../src/maintenance-status.js";
import { assetInput, prepareAsset, updateCoverageDates } from "../server/domain.js";
import { createStore } from "../server/store.js";
import type { Asset, MaintenanceCoverage } from "../src/types.js";

const contractId = randomUUID();
const plan = (
  patch: Partial<MaintenanceCoverage> = {},
): MaintenanceCoverage => ({
  id: randomUUID(),
  contractId,
  periodValue: 1,
  periodUnit: "months",
  anchorDate: null,
  anchorType: "Primeira manutenção",
  firstDueDate: "2026-11-10",
  validFrom: "2026-11-01",
  validUntil: "2026-11-30",
  reviewed: true,
  createdAt: "2026-11-01T00:00:00Z",
  ...patch,
});
const asset = (patch: Partial<Asset> = {}): Asset => ({
  id: randomUUID(),
  name: "Bomba sintética",
  patrimony: "SINT-RESP-01",
  brand: "",
  model: "",
  serial: "",
  sector: "UTI sintética",
  notes: "",
  contractId,
  periodValue: 1,
  periodUnit: "months",
  anchorDate: null,
  anchorType: "Primeira manutenção",
  firstDueDate: "2026-11-10",
  validFrom: "2026-11-01",
  validUntil: "2026-11-30",
  reviewed: true,
  simulated: false,
  updatedAt: "2026-11-01T00:00:00Z",
  ...patch,
});

test("cobertura exige contrato conferido e datas conhecidas; inclui os dias de início e fim", () => {
  for (const day of ["2026-11-01", "2026-11-07", "2026-11-30"])
    assert.equal(maintenanceStatus(asset(), day).group, "covered");
  assert.equal(
    maintenanceStatus(asset({ reviewed: false }), "2026-11-07").kind,
    "review",
  );
  assert.equal(
    maintenanceStatus(asset({ contractId: null }), "2026-11-07").group,
    "attention",
  );
});

test("contrato conferido com vigência incompleta não volta a revisão pendente", () => {
  for (const dates of [
    { validFrom: null },
    { validUntil: null },
    { validFrom: null, validUntil: null },
  ]) {
    for (const useCoverages of [false, true]) {
      const input = asset({
        ...dates,
        ...(useCoverages ? { coverages: [plan(dates)] } : {}),
      });
      const status = maintenanceStatus(input, "2026-11-07");
      assert.equal(status.kind, "dates");
      assert.equal(status.label, "Vigência da manutenção a confirmar");
      assert.equal(status.group, "attention");
      assert.equal(status.contractId, contractId);
      assert.match(status.detail, /não sabemos se a cobertura de manutenção está vigente hoje/);
      assert.equal(input.reviewed, true);
      assert.equal(
        maintenanceStatus(
          asset({
            ...dates,
            reviewed: false,
            ...(useCoverages
              ? { coverages: [plan({ ...dates, reviewed: false })] }
              : {}),
          }),
          "2026-11-07",
        ).kind,
        "review",
      );
    }
  }
});

test("distingue contrato vencido, contrato futuro e lacuna entre coberturas", () => {
  assert.equal(
    maintenanceStatus(asset(), "2026-12-01").label,
    "Cobertura de manutenção encerrada",
  );
  assert.equal(maintenanceStatus(asset(), "2026-10-31").label, "Sem cobertura de manutenção");
  const old = plan({ validFrom: "2026-01-01", validUntil: "2026-10-31" });
  const future = plan({
    contractId: randomUUID(),
    validFrom: "2026-12-01",
    validUntil: "2027-11-30",
  });
  const status = maintenanceStatus(
    asset({ coverages: [old, future] }),
    "2026-11-07",
  );
  assert.equal(status.group, "attention");
  assert.equal(status.contractId, future.contractId);
});

test("renovação pendente ou futura não oculta contrato ainda vigente", () => {
  const old = plan();
  const pending = plan({
    contractId: randomUUID(),
    validFrom: "2026-11-05",
    validUntil: "2027-11-04",
    reviewed: false,
  });
  assert.equal(
    maintenanceStatus(asset({ coverages: [old, pending] }), "2026-11-07")
      .contractId,
    old.contractId,
  );
  const renewed = { ...pending, reviewed: true };
  assert.equal(
    maintenanceStatus(asset({ coverages: [old, renewed] }), "2026-11-07")
      .contractId,
    renewed.contractId,
  );
  assert.equal(
    maintenanceStatus(
      asset({ coverages: [old, { ...renewed, validFrom: "2026-12-01" }] }),
      "2026-11-07",
    ).contractId,
    old.contractId,
  );
});

test("não presume oficina interna pela ausência de contrato; exige definição explícita", () => {
  assert.equal(
    maintenanceStatus(asset({ contractId: null }), "2026-11-07").label,
    "Responsável não definido",
  );
  assert.deepEqual(
    maintenanceStatus(asset({ maintenanceProvider: "internal" }), "2026-11-07"),
    {
      kind: "internal",
      group: "internal",
      label: "Manutenção interna",
      detail: "Oficina de Manutenção",
    },
  );
  assert.equal(
    maintenanceStatus(
      asset({ maintenanceProvider: "unassigned" }),
      "2026-11-07",
    ).group,
    "attention",
  );
  assert.equal(
    maintenanceStatus(
      asset({ maintenanceProvider: "contract", contractId: null }),
      "2026-11-07",
    ).label,
    "Sem cobertura de manutenção",
  );
});

test("responsabilidade persiste e edição de outros campos preserva definição sem alterar coberturas", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-responsibility-"));
  let store = createStore(join(directory, "test.sqlite"));
  try {
    const contract = store.upload(
      "sintetico.txt",
      "text/plain",
      Buffer.from("Documento sintético de manutenção"),
    );
    const original = prepareAsset(
      undefined,
      assetInput.parse({ ...asset(), contractId: contract.id }),
    );
    store.saveAsset(original);
    store.saveAsset({
      ...store.listAssets()[0],
      maintenanceProvider: "internal",
    });
    store.close();
    store = createStore(join(directory, "test.sqlite"));
    const loaded = store.listAssets()[0];
    assert.equal(loaded.maintenanceProvider, "internal");
    assert.deepEqual(
      loaded.coverages?.map(({ contractName: _name, ...value }) => value),
      original.coverages,
    );
    const { maintenanceProvider: _provider, ...legacyInput } = loaded;
    const edited = prepareAsset(
      loaded,
      assetInput.parse({ ...legacyInput, sector: "Oficina sintética" }),
    );
    assert.equal(edited.maintenanceProvider, "internal");
    assert.equal(
      assetInput.safeParse({
        ...legacyInput,
        maintenanceProvider: "external-invalid",
      }).success,
      false,
    );
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});


test("completar vigência persiste as datas e remove a pendência sem nova revisão", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-coverage-dates-"));
  const store = createStore(join(directory, "test.sqlite"));
  try {
    const contract = store.upload("vigencia.txt", "text/plain", Buffer.from("Contrato sintético"));
    const input = asset({ contractId: contract.id, validFrom: null, validUntil: null });
    const original = store.saveAsset(prepareAsset(undefined, assetInput.parse(input)));
    const status = maintenanceStatus(original, "2026-11-07");
    assert.equal(status.kind, "dates");
    const saved = store.saveAsset(updateCoverageDates(original, status.coverageId!, {
      validFrom: "2026-11-01", validUntil: "2026-11-30",
    }));
    const loaded = store.listAssets().find((item) => item.id === saved.id)!;
    assert.equal(maintenanceStatus(loaded, "2026-11-07").kind, "covered");
    assert.equal(loaded.reviewed, true);
    assert.equal(loaded.coverages![0].reviewed, true);
    assert.equal(loaded.coverages![0].id, original.coverages![0].id);
    assert.equal(loaded.periodValue, original.periodValue);
    assert.equal(loaded.contractId, original.contractId);
    assert.equal(loaded.coverages!.length, 1);
    assert.equal(maintenanceStatus(loaded, "2026-12-01").kind, "expired");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("edição direta altera somente a cobertura escolhida e preserva renovação pendente", () => {
  const original = plan({ validFrom: null, validUntil: null });
  const renewal = plan({ contractId: randomUUID(), reviewed: false, validFrom: "2026-12-01", validUntil: "2027-11-30", firstDueDate: "2026-12-10" });
  const input = asset({ ...renewal, id: randomUUID(), simulated: false, coverages: [original, renewal] });
  const saved = updateCoverageDates(input, original.id, { validFrom: "2026-11-01", validUntil: "2026-11-30" });
  assert.deepEqual(saved.coverages![1], renewal);
  assert.equal(saved.reviewed, false);
  assert.equal(saved.validFrom, input.validFrom);
  assert.equal(saved.contractId, renewal.contractId);
  assert.equal(maintenanceStatus(saved, "2026-11-07").kind, "covered");
  assert.equal(maintenanceStatus(saved, "2026-11-07").contractId, original.contractId);
  assert.equal(original.validFrom, null);
});

test("edição de vigência rejeita datas inválidas, inversão, cobertura alheia e inversão de coberturas", () => {
  const original = plan();
  const input = asset({ coverages: [original] });
  for (const dates of [
    { validFrom: "2026-02-30", validUntil: "2026-11-30" },
    { validFrom: "2026-11-30", validUntil: "2026-11-01" },
    { validFrom: "", validUntil: "2026-11-30" },
  ]) assert.throws(() => updateCoverageDates(input, original.id, dates));
  assert.throws(() => updateCoverageDates(input, randomUUID(), { validFrom: "2026-11-01", validUntil: "2026-11-30" }));
  const later = plan({ validFrom: "2026-12-01", validUntil: "2027-11-30", firstDueDate: "2026-12-10" });
  assert.throws(() => updateCoverageDates(asset({ coverages: [original, later] }), original.id, { validFrom: "2026-12-02", validUntil: "2027-11-30" }));
});


test("escolha da oficina ou manutenção indefinida prevalece sobre a vigência documental", () => {
  const incomplete = asset({ validFrom: null, validUntil: null, coverages: [plan({ validFrom: null, validUntil: null })] });
  assert.equal(maintenanceStatus(incomplete, "2026-11-07").kind, "dates");
  assert.equal(maintenanceStatus({ ...incomplete, maintenanceProvider: "internal" }, "2026-11-07").kind, "internal");
  assert.equal(maintenanceStatus({ ...incomplete, maintenanceProvider: "unassigned" }, "2026-11-07").kind, "unassigned");
  assert.equal(incomplete.coverages![0].validFrom, null);
});

test("aditivo pode fornecer a cobertura de manutenção da unidade", () => {
  const amendmentId = randomUUID();
  const principal = plan({ validFrom: "2026-01-01", validUntil: "2026-10-31", firstDueDate: "2026-01-10" });
  const amendment = plan({ contractId: amendmentId });
  const input = asset({ maintenanceProvider: "contract", contractId: amendmentId, coverages: [principal, amendment] });
  const status = maintenanceStatus(input, "2026-11-07");
  assert.equal(status.kind, "covered");
  assert.equal(status.contractId, amendmentId);
  assert.equal(input.coverages!.length, 2);
});
