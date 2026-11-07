import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assetInput, eventsFor, prepareAsset } from "../server/domain.js";
import { createStore } from "../server/store.js";
import type { Asset } from "../src/types.js";

const input = (contractId: string | null, patrimony = "SINT-1") =>
  assetInput.parse({
    name: "Equipamento sintético",
    patrimony,
    contractId,
    periodValue: 10,
    periodUnit: "days",
    anchorDate: null,
    anchorType: "Primeira manutenção",
    firstDueDate: "2026-01-10",
    validFrom: "2026-01-01",
    validUntil: "2026-01-31",
    reviewed: true,
  });

test("um contrato cobre várias unidades físicas; validade limita as previsões", () => {
  const store = createStore(":memory:");
  try {
    const contract = store.upload(
      "sintetico.txt",
      "text/plain",
      Buffer.from("contrato sintético"),
    );
    store.saveAssets([
      prepareAsset(undefined, input(contract.id)),
      prepareAsset(undefined, input(contract.id, "SINT-2")),
    ]);
    const assets = store.listAssets();
    assert.equal(assets.length, 2);
    assert.notEqual(assets[0].id, assets[1].id);
    assert.equal(
      assets[0].coverages![0].contractId,
      assets[1].coverages![0].contractId,
    );
    const events = eventsFor(assets, "2025-12-01", "2026-02-28");
    assert.equal(events.length, 6);
    assert.deepEqual(
      events
        .filter((event) => event.assetId === assets[0].id)
        .map((event) => event.date),
      ["2026-01-10", "2026-01-20", "2026-01-30"],
    );
    assert.ok(events.every((event) => event.contractId === contract.id));
  } finally {
    store.close();
  }
});

test("renovação preserva o contrato anterior, recorta sobreposição e sobrevive ao reinício", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-contracts-"));
  let store = createStore(join(dir, "db.sqlite"));
  try {
    const old = store.upload(
      "anterior.txt",
      "text/plain",
      Buffer.from("contrato anterior"),
    );
    const next = store.upload(
      "novo.txt",
      "text/plain",
      Buffer.from("novo contrato"),
    );
    const first = prepareAsset(undefined, {
      ...input(old.id),
      validUntil: "2026-03-31",
    });
    store.saveAsset(first);
    const renewed = prepareAsset(
      store.listAssets()[0],
      {
        ...input(next.id),
        firstDueDate: "2026-02-05",
        validFrom: "2026-02-01",
        validUntil: "2026-02-28",
      },
      true,
    );
    store.saveAsset(renewed);
    store.close();
    store = createStore(join(dir, "db.sqlite"));
    const saved = store.listAssets()[0];
    assert.equal(saved.id, first.id);
    assert.equal(saved.coverages!.length, 2);
    assert.equal(saved.coverages![0].validUntil, "2026-03-31");
    assert.ok(store.getBytes(old.id));
    assert.ok(store.getBytes(next.id));
    const events = eventsFor([saved], "2026-01-01", "2026-03-31");
    assert.deepEqual(
      events.map((event) => event.date),
      [
        "2026-01-10",
        "2026-01-20",
        "2026-01-30",
        "2026-02-05",
        "2026-02-15",
        "2026-02-25",
      ],
    );
    assert.ok(
      events
        .filter((event) => event.date < "2026-02-01")
        .every((event) => event.contractId === old.id),
    );
    assert.ok(
      events
        .filter((event) => event.date >= "2026-02-01")
        .every((event) => event.contractId === next.id),
    );
    assert.equal(new Set(events.map((event) => event.id)).size, events.length);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("lacuna entre contratos fica sem cobertura; contrato pendente não ativa substituição", () => {
  const oldId = randomUUID();
  const nextId = randomUUID();
  const old = prepareAsset(undefined, {
    ...input(oldId),
    validUntil: "2026-01-20",
  });
  const renewed = prepareAsset(
    old,
    {
      ...input(nextId),
      validFrom: "2026-02-10",
      validUntil: "2026-02-28",
      firstDueDate: "2026-02-15",
    },
    true,
  );
  assert.deepEqual(
    eventsFor([renewed], "2026-01-01", "2026-02-28").map((event) => event.date),
    ["2026-01-10", "2026-01-20", "2026-02-15", "2026-02-25"],
  );
  const extendedOld = prepareAsset(undefined, {
    ...input(oldId),
    validUntil: "2026-03-31",
  });
  const pending = prepareAsset(
    extendedOld,
    {
      ...input(nextId),
      validFrom: "2026-02-01",
      firstDueDate: null,
      validUntil: "2026-02-28",
      reviewed: false,
    },
    true,
  );
  assert.deepEqual(
    eventsFor([pending], "2026-02-01", "2026-02-28").map((event) => event.date),
    ["2026-02-09", "2026-02-19"],
  );
});

test("não permite trocar contrato sem renovação explícita nem renovar sem início", () => {
  const previous = prepareAsset(undefined, input(randomUUID()));
  assert.throws(
    () => prepareAsset(previous, input(randomUUID())),
    /configurações avançadas/,
  );
  assert.throws(
    () =>
      prepareAsset(previous, { ...input(randomUUID()), validFrom: null }, true),
    /começa/,
  );
  assert.throws(
    () => prepareAsset(previous, input(previous.contractId), true),
    /diferente/,
  );
  assert.equal(
    assetInput.safeParse({
      ...input(randomUUID()),
      validFrom: "2026-02-01",
      validUntil: "2026-01-01",
    }).success,
    false,
  );
  assert.equal(
    assetInput.safeParse({ ...input(randomUUID()), firstDueDate: "2026-02-01" })
      .success,
    false,
  );
});

test("lote inválido faz rollback de todos os cadastros e vínculos", () => {
  const store = createStore(":memory:");
  try {
    const contract = store.upload(
      "sintetico.txt",
      "text/plain",
      Buffer.from("conteúdo sintético"),
    );
    assert.throws(
      () =>
        store.saveAssets([
          prepareAsset(undefined, input(contract.id)),
          prepareAsset(undefined, input(contract.id)),
        ]),
      /UNIQUE/,
    );
    assert.deepEqual(store.listAssets(), []);
    store.saveAssets([
      prepareAsset(undefined, input(contract.id)),
      prepareAsset(undefined, input(contract.id, "SINT-2")),
    ]);
    const before = store.listAssets();
    store.saveAsset(
      prepareAsset(before[0], {
        ...input(contract.id),
        name: "Novo nome sintético",
      }),
    );
    assert.deepEqual(store.listAssets()[1], before[1]);
  } finally {
    store.close();
  }
});

test("migração aditiva preserva dados legados e calendário sem limpar o banco", () => {
  const dir = mkdtempSync(join(tmpdir(), "consta-migration-"));
  const filename = join(dir, "legacy.sqlite");
  const db = new DatabaseSync(filename);
  const legacy: Asset = {
    id: randomUUID(),
    name: "Legado sintético",
    brand: "",
    model: "",
    patrimony: "LEGACY-1",
    serial: "",
    sector: "",
    contractId: null,
    periodValue: 1,
    periodUnit: "months",
    anchorDate: "2024-01-31",
    anchorType: "Instalação",
    reviewed: true,
    notes: "Preservar",
    simulated: true,
    updatedAt: "2024-01-01T00:00:00Z",
  };
  db.exec(
    "CREATE TABLE contracts (id TEXT PRIMARY KEY, hash TEXT UNIQUE NOT NULL, metadata TEXT NOT NULL, bytes BLOB NOT NULL); CREATE TABLE assets (id TEXT PRIMARY KEY,patrimony TEXT UNIQUE NOT NULL,payload TEXT NOT NULL,contract_id TEXT REFERENCES contracts(id)); PRAGMA user_version=1;",
  );
  db.prepare("INSERT INTO assets VALUES (?,?,?,?)").run(
    legacy.id,
    legacy.patrimony,
    JSON.stringify(legacy),
    null,
  );
  db.close();
  const store = createStore(filename);
  try {
    const migrated = store.listAssets()[0];
    assert.equal(migrated.notes, "Preservar");
    assert.equal(migrated.coverages!.length, 1);
    assert.deepEqual(
      eventsFor([migrated], "2024-02-01", "2024-03-31").map(
        (event) => event.date,
      ),
      ["2024-02-29", "2024-03-31"],
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
