import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createStore } from "../server/store.js";
import { assetInput, eventsFor, prepareAsset } from "../server/domain.js";
import { contractFile } from "../server/contract-file.js";
import { maintenanceStatus } from "../src/maintenance-status.js";
import {
  groupContracts,
  assetHasDocument,
  documentKindLabel,
} from "../src/contract-groups.js";

const file = (label: string) => ({
  name: `${label}.txt`,
  mime: "text/plain",
  bytes: Buffer.from(`Documento sintético: ${label}`),
});
const input = (contractId: string | null) =>
  assetInput.parse({
    name: "Monitor sintético",
    brand: "Marca sintética",
    model: "Modelo sintético",
    patrimony: "DOC-SINT-01",
    sector: "UTI sintética",
    contractId,
    periodValue: 1,
    periodUnit: "months",
    firstDueDate: "2026-11-10",
    anchorDate: null,
    anchorType: "Primeira manutenção",
    validFrom: "2026-11-01",
    validUntil: "2027-10-31",
    reviewed: true,
    maintenanceProvider: "internal",
  });

test("anexo persiste com descrição e principal sem modificar contrato, marca, cobertura ou previsões", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-maintenance-docs-"));
  const database = join(directory, "test.sqlite");
  let store = createStore(database);
  try {
    const mainFile = file("principal");
    const main = store.upload(mainFile.name, mainFile.mime, mainFile.bytes);
    const created = store.saveAsset(prepareAsset(undefined, input(main.id)));
    const before = store.listAssets()[0];
    const forecasts = eventsFor([before], "2026-11-01", "2027-10-31");
    const attachment = file("aditivo");
    const result = store.attachMaintenanceDocument(created.id, attachment, {
      kind: "amendment",
      notes: "Prorrogação solicitada para manutenção preventiva.",
    });
    assert.equal(result.maintenanceProvider, "contract");
    assert.equal(result.contractId, main.id);
    assert.equal(result.brand, "Marca sintética");
    assert.deepEqual(result.coverages, before.coverages);
    assert.deepEqual(
      eventsFor([result], "2026-11-01", "2027-10-31"),
      forecasts,
    );
    const record = result.maintenanceDocuments![0];
    assert.equal(
      record.notes,
      "Prorrogação solicitada para manutenção preventiva.",
    );
    assert.equal(
      store.getContract(record.contractId)?.parentContractId,
      main.id,
    );
    assert.deepEqual(store.getBytes(record.contractId), attachment.bytes);
    assert.equal(assetHasDocument(result, new Set([record.contractId])), true);
    assert.equal(
      groupContracts(store.listContracts(), [result])[0].units.length,
      1,
    );
    const repeated = store.attachMaintenanceDocument(created.id, attachment, {
      kind: "amendment",
      notes: "Uma nova descrição não reescreve o registro.",
    });
    assert.equal(repeated.maintenanceDocuments!.length, 1);
    assert.deepEqual(repeated.maintenanceDocuments![0], record);
    store.saveAsset(
      prepareAsset(
        repeated,
        assetInput.parse({ ...repeated, sector: "Enfermaria sintética" }),
      ),
    );
    store.close();
    store = createStore(database);
    assert.deepEqual(store.listAssets()[0].maintenanceDocuments![0], record);
    assert.equal(
      maintenanceStatus(store.listAssets()[0], "2026-11-07").kind,
      "covered",
    );
    store.close();
    const db = new DatabaseSync(database);
    try {
      assert.equal(
        (db.prepare("PRAGMA user_version").get() as { user_version: number })
          .user_version,
        6,
      );
    } finally {
      db.close();
    }
    store = createStore(database);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("aditivos e contratos terceirizados preservam o principal de origem", () => {
  const store = createStore(":memory:");
  try {
    const mainFile = file("principal-origem");
    const main = store.upload(mainFile.name, mainFile.mime, mainFile.bytes);
    const asset = store.saveAsset(prepareAsset(undefined, input(main.id)));
    const before = store.listAssets()[0];
    for (const kind of ["contract", "complement"] as const) {
      assert.throws(() =>
        store.attachMaintenanceDocument(asset.id, file(kind), { kind }),
      );
      assert.deepEqual(store.listAssets()[0], before);
      assert.equal(store.listContracts().length, 1);
    }
    for (const kind of ["amendment", "outsourced"] as const) {
      const updated = store.attachMaintenanceDocument(asset.id, file(kind), {
        kind,
      });
      assert.equal(updated.contractId, main.id);
      assert.equal(
        store.getContract(updated.maintenanceDocuments![0].contractId)
          ?.parentContractId,
        main.id,
      );
    }
    assert.equal(store.listAssets()[0].maintenanceDocuments!.length, 2);
  } finally {
    store.close();
  }
});

test("falha de vínculo faz rollback do arquivo e da responsabilidade; documento de outro principal não é movido", () => {
  const store = createStore(":memory:");
  try {
    const asset = store.saveAsset(prepareAsset(undefined, input(null)));
    assert.throws(
      () =>
        store.attachMaintenanceDocument(
          asset.id,
          file("aditivo-sem-principal"),
          { kind: "amendment" },
        ),
      /Termo de Contrato/,
    );
    assert.equal(store.listContracts().length, 0);
    assert.equal(store.listAssets()[0].maintenanceProvider, "internal");
    const mainFile = file("original");
    const main = store.upload(mainFile.name, mainFile.mime, mainFile.bytes);
    const withMain = store.saveAsset(
      prepareAsset(
        store.listAssets()[0],
        assetInput.parse({
          ...input(main.id),
          validFrom: "2027-11-01",
          validUntil: "2028-10-31",
          firstDueDate: "2027-11-10",
        }),
        true,
      ),
    );
    const before = store.listAssets()[0];
    assert.throws(
      () =>
        store.attachMaintenanceDocument(withMain.id, mainFile, {
          kind: "amendment",
        }),
      /já é o Termo de Contrato/,
    );
    assert.equal(store.listContracts().length, 1);
    assert.deepEqual(store.listAssets()[0], before);
    const otherFile = file("outro-principal");
    const other = store.upload(otherFile.name, otherFile.mime, otherFile.bytes);
    const conflictFile = file("aditivo-outro-principal");
    const conflict = store.upload(
      conflictFile.name,
      conflictFile.mime,
      conflictFile.bytes,
    );
    store.setContractParent(conflict.id, other.id);
    assert.throws(
      () =>
        store.attachMaintenanceDocument(withMain.id, conflictFile, {
          kind: "amendment",
        }),
      /outro TC/,
    );
    assert.equal(store.getContract(conflict.id)?.parentContractId, other.id);
    assert.deepEqual(store.listAssets()[0], before);
    assert.throws(
      () =>
        store.attachMaintenanceDocument("ausente", file("sem-equipamento"), {
          kind: "amendment",
        }),
      /Equipamento não encontrado/,
    );
    assert.throws(() =>
      store.attachMaintenanceDocument(asset.id, file("notas-longas"), {
        kind: "amendment",
        notes: "x".repeat(4001),
      }),
    );
  } finally {
    store.close();
  }
});

test("o mesmo validador limita tipo, tamanho e nome dos arquivos de cadastro e histórico", () => {
  const uploaded = {
    originalname: "termo.txt",
    size: 11,
    buffer: Buffer.from("Termo teste"),
  } as Express.Multer.File;
  assert.equal(contractFile(uploaded).mime, "text/plain");
  assert.throws(
    () => contractFile({ ...uploaded, originalname: "falso.pdf" }),
    /Formato inválido/,
  );
  assert.throws(
    () => contractFile({ ...uploaded, size: 16 * 1024 * 1024 }),
    /15 MB/,
  );
  assert.throws(
    () => contractFile({ ...uploaded, buffer: Buffer.from([0xff]) }),
    /UTF-8/,
  );
  assert.throws(
    () => contractFile({ ...uploaded, buffer: Buffer.from([0]) }),
    /texto válido/,
  );
  assert.equal(
    contractFile({ ...uploaded, originalname: "pasta/termo.txt" }).name,
    "pasta_termo.txt",
  );
});

test("migração da versão 3 preserva aditivos e aceita contrato terceirizado sem mudar seu tipo ou cobertura", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-documents-v3-"));
  const database = join(directory, "test.sqlite");
  let store = createStore(database);
  try {
    const mainFile = file("principal-migracao");
    const main = store.upload(mainFile.name, mainFile.mime, mainFile.bytes);
    const asset = store.saveAsset(prepareAsset(undefined, input(main.id)));
    const first = store.attachMaintenanceDocument(
      asset.id,
      file("aditivo-migracao"),
      { kind: "amendment" },
    );
    const previousHistory = first.maintenanceDocuments;
    const previousCoverage = first.coverages;
    store.close();
    const db = new DatabaseSync(database);
    try {
      db.exec(`BEGIN;
        ALTER TABLE asset_documents RENAME TO documents_backup;
        CREATE TABLE asset_documents (
          id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES assets(id),
          contract_id TEXT NOT NULL REFERENCES contracts(id),
          kind TEXT NOT NULL CHECK(kind IN ('contract','amendment','complement')),
          notes TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(asset_id,contract_id)
        );
        INSERT INTO asset_documents SELECT * FROM documents_backup ORDER BY rowid;
        DROP TABLE documents_backup;
        PRAGMA user_version=3; COMMIT;`);
    } finally {
      db.close();
    }
    store = createStore(database);
    assert.deepEqual(
      store.listAssets()[0].maintenanceDocuments,
      previousHistory,
    );
    const externalFile = file("contrato-empresa-externa");
    const updated = store.attachMaintenanceDocument(asset.id, externalFile, {
      kind: "outsourced",
    });
    const externalId = updated.maintenanceDocuments![0].contractId;
    assert.equal(updated.contractId, main.id);
    assert.deepEqual(updated.coverages, previousCoverage);
    assert.equal(store.getContract(externalId)?.parentContractId, main.id);
    assert.equal(
      documentKindLabel(store.getContract(externalId)!),
      "Contrato de manutenção",
    );
    store.setContractParent(externalId, main.id);
    assert.equal(store.getContract(externalId)?.documentKind, "outsourced");
    const repeated = store.attachMaintenanceDocument(asset.id, externalFile, {
      kind: "outsourced",
    });
    assert.equal(repeated.maintenanceDocuments!.length, 2);
    store.close();
    store = createStore(database);
    assert.deepEqual(
      store.listAssets()[0].maintenanceDocuments,
      repeated.maintenanceDocuments,
    );
    assert.deepEqual(store.listAssets()[0].coverages, previousCoverage);
    assert.equal(store.getContract(externalId)?.documentKind, "outsourced");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
