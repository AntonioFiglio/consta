import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { coverageFromAsset } from "./domain.js";
import type {
  Asset,
  Contract,
  Extraction,
  MaintenanceCoverage,
} from "../src/types.js";

export function createStore(filename: string, seed = false) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, hash TEXT UNIQUE NOT NULL, metadata TEXT NOT NULL, bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, patrimony TEXT UNIQUE NOT NULL, payload TEXT NOT NULL, contract_id TEXT REFERENCES contracts(id));
    CREATE TABLE IF NOT EXISTS asset_contracts (id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES assets(id), contract_id TEXT REFERENCES contracts(id), position INTEGER NOT NULL, payload TEXT NOT NULL, UNIQUE(asset_id, position));`);
  // Migração aditiva: mantém cadastros/arquivos existentes e registra a cobertura legada.
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const row of db
      .prepare(
        "SELECT id,payload FROM assets WHERE id NOT IN (SELECT asset_id FROM asset_contracts)",
      )
      .all() as { id: string; payload: string }[]) {
      const asset: Asset = JSON.parse(row.payload);
      const coverage = coverageFromAsset(asset);
      db.prepare(
        "INSERT INTO asset_contracts (id,asset_id,contract_id,position,payload) VALUES (?,?,?,?,?)",
      ).run(
        coverage.id,
        asset.id,
        coverage.contractId,
        0,
        JSON.stringify(coverage),
      );
    }
    db.exec("PRAGMA user_version=2; COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const listAssets = (): Asset[] =>
    (
      db.prepare("SELECT payload FROM assets ORDER BY patrimony").all() as {
        payload: string;
      }[]
    ).map((row) => {
      const asset: Asset = JSON.parse(row.payload);
      return {
        ...asset,
        coverages: (
          db
            .prepare(
              "SELECT payload FROM asset_contracts WHERE asset_id=? ORDER BY position",
            )
            .all(asset.id) as { payload: string }[]
        ).map((row) => {
          const plan: MaintenanceCoverage = JSON.parse(row.payload);
          return {
            ...plan,
            contractName: plan.contractId
              ? getContract(plan.contractId)?.name
              : null,
          };
        }),
        contractName: asset.contractId
          ? getContract(asset.contractId)?.name
          : null,
      };
    });
  function getContract(id: string): Contract | null {
    const row = db
      .prepare("SELECT metadata FROM contracts WHERE id=?")
      .get(id) as { metadata: string } | undefined;
    return row ? JSON.parse(row.metadata) : null;
  }
  function saveAssets(assets: Asset[]) {
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const asset of assets) {
        const { coverages, ...payload } = asset;
        const plans = coverages?.length
          ? coverages
          : [coverageFromAsset(asset)];
        db.prepare(
          `INSERT INTO assets (id,patrimony,payload,contract_id) VALUES (?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET patrimony=excluded.patrimony,payload=excluded.payload,contract_id=excluded.contract_id`,
        ).run(
          asset.id,
          asset.patrimony.toLocaleUpperCase("pt-BR"),
          JSON.stringify(payload),
          asset.contractId,
        );
        for (let position = 0; position < plans.length; position++) {
          const plan = plans[position];
          db.prepare(
            `INSERT INTO asset_contracts (id,asset_id,contract_id,position,payload) VALUES (?,?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,contract_id=excluded.contract_id`,
          ).run(
            plan.id,
            asset.id,
            plan.contractId,
            position,
            JSON.stringify(plan),
          );
        }
      }
      db.exec("COMMIT");
      return assets;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  function saveAsset(asset: Asset) {
    return saveAssets([asset])[0];
  }
  function upload(name: string, mime: string, bytes: Buffer) {
    const hash = createHash("sha256").update(bytes).digest("hex");
    const existing = db
      .prepare("SELECT metadata FROM contracts WHERE hash=?")
      .get(hash) as { metadata: string } | undefined;
    if (existing) return JSON.parse(existing.metadata) as Contract;
    const contract: Contract = {
      id: randomUUID(),
      name,
      mime,
      createdAt: new Date().toISOString(),
      extraction: null,
    };
    db.prepare(
      "INSERT INTO contracts (id,hash,metadata,bytes) VALUES (?,?,?,?)",
    ).run(contract.id, hash, JSON.stringify(contract), bytes);
    return contract;
  }
  function saveExtraction(id: string, extraction: Extraction) {
    const contract = getContract(id);
    if (!contract) throw new Error("NOT_FOUND");
    contract.extraction = extraction;
    db.prepare("UPDATE contracts SET metadata=? WHERE id=?").run(
      JSON.stringify(contract),
      id,
    );
    return contract;
  }
  function getBytes(id: string): Buffer | null {
    const row = db.prepare("SELECT bytes FROM contracts WHERE id=?").get(id) as
      { bytes: Uint8Array } | undefined;
    return row ? Buffer.from(row.bytes) : null;
  }
  if (seed && !db.prepare("SELECT id FROM assets LIMIT 1").get()) {
    const now = new Date();
    const anchor = (day: number) =>
      `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const [name, model, patrimony, sector, day, periodValue] of [
      [
        "Bomba de infusão",
        "Modelo demonstrativo A",
        "DEMO-001",
        "UTI • Ala A",
        10,
        6,
      ],
      [
        "Monitor multiparamétrico",
        "Modelo demonstrativo B",
        "DEMO-002",
        "Enfermaria • Ala B",
        18,
        3,
      ],
      [
        "Ventilador de transporte",
        "Modelo demonstrativo C",
        "DEMO-003",
        "Centro cirúrgico",
        25,
        12,
      ],
    ] as const) {
      const content = Buffer.from(
        `CONTRATO SINTÉTICO — SOMENTE DEMONSTRAÇÃO\nEquipamento: ${name}.\nModelo: ${model}.\nManutenção preventiva a cada ${periodValue} meses desde a instalação.\nData de instalação fictícia: ${anchor(day)}.\nNenhum dado representa um hospital real.`,
      );
      const contract = upload(
        `contrato-sintetico-${patrimony.toLowerCase()}.txt`,
        "text/plain",
        content,
      );
      saveAsset({
        id: randomUUID(),
        name,
        model,
        patrimony,
        serial: "",
        sector,
        contractId: contract.id,
        periodValue,
        periodUnit: "months",
        anchorDate: anchor(day),
        anchorType: "Instalação",
        reviewed: true,
        notes:
          "Exemplo sintético para explorar o calendário. Não representa uma manutenção real.",
        simulated: true,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return {
    listAssets,
    getContract,
    listContracts: () =>
      (
        db
          .prepare("SELECT metadata FROM contracts ORDER BY rowid DESC")
          .all() as { metadata: string }[]
      ).map((row) => {
        const { extraction: _extraction, ...summary } = JSON.parse(
          row.metadata,
        ) as Contract;
        return summary;
      }),
    saveAsset,
    saveAssets,
    upload,
    saveExtraction,
    getBytes,
    close: () => db.close(),
  };
}
