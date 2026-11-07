import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  coverageFromAsset,
  DomainError,
  maintenanceDocumentInput,
} from "./domain.js";
import { contactFromExtraction } from "../src/maintenance-contact.js";
import type {
  Asset,
  Contract,
  ContractBrief,
  ContractBriefRecord,
  Extraction,
  MaintenanceCoverage,
  MaintenanceDocument,
  MaintenanceDocumentKind,
} from "../src/types.js";

export function createStore(filename: string, seed = false) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, hash TEXT UNIQUE NOT NULL, metadata TEXT NOT NULL, bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, patrimony TEXT NOT NULL, payload TEXT NOT NULL, contract_id TEXT REFERENCES contracts(id));
    CREATE TABLE IF NOT EXISTS asset_contracts (id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES assets(id), contract_id TEXT REFERENCES contracts(id), position INTEGER NOT NULL, payload TEXT NOT NULL, UNIQUE(asset_id, position));`);
  // Migração aditiva: mantém cadastros/arquivos existentes e registra a cobertura legada.
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE");
  try {
    const assetsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE name='assets'").get() as { sql: string };
    if (/patrimony\s+TEXT\s+UNIQUE/i.test(assetsSchema.sql)) {
      db.exec(`CREATE TABLE assets_v6 (
        id TEXT PRIMARY KEY, patrimony TEXT NOT NULL, payload TEXT NOT NULL,
        contract_id TEXT REFERENCES contracts(id));
        INSERT INTO assets_v6 SELECT id,patrimony,payload,contract_id FROM assets;
        DROP TABLE assets;
        ALTER TABLE assets_v6 RENAME TO assets;`);
    }
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS assets_known_patrimony
      ON assets(patrimony) WHERE patrimony <> '';
      CREATE UNIQUE INDEX IF NOT EXISTS assets_import_unit
      ON assets(json_extract(payload,'$.importSource.contractId'),json_extract(payload,'$.importSource.unitKey'))
      WHERE json_extract(payload,'$.importSource.contractId') IS NOT NULL
        AND json_extract(payload,'$.importSource.unitKey') IS NOT NULL;`);
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
    db.exec(`CREATE TABLE IF NOT EXISTS asset_documents (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL REFERENCES assets(id),
      contract_id TEXT NOT NULL REFERENCES contracts(id),
      kind TEXT NOT NULL CHECK(kind IN ('contract','amendment','complement')),
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(asset_id,contract_id)
    );`);
    const documentSchema = db
      .prepare("SELECT sql FROM sqlite_master WHERE name='asset_documents'")
      .get() as { sql: string };
    if (!documentSchema.sql.includes("'outsourced'")) {
      db.exec(`CREATE TABLE asset_documents_v4 (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL REFERENCES assets(id),
        contract_id TEXT NOT NULL REFERENCES contracts(id),
        kind TEXT NOT NULL CHECK(kind IN ('contract','amendment','outsourced','complement')),
        notes TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(asset_id,contract_id)
      );
      INSERT INTO asset_documents_v4 (rowid,id,asset_id,contract_id,kind,notes,created_at)
        SELECT rowid,id,asset_id,contract_id,kind,notes,created_at FROM asset_documents;
      DROP TABLE asset_documents;
      ALTER TABLE asset_documents_v4 RENAME TO asset_documents;`);
    }
    db.exec(`CREATE TABLE IF NOT EXISTS contract_briefs (
      contract_id TEXT PRIMARY KEY REFERENCES contracts(id),
      state TEXT NOT NULL CHECK(state IN ('pending','ready','failed')),
      mode TEXT NOT NULL CHECK(mode IN ('ai','simulated')),
      started_at TEXT NOT NULL,
      token TEXT,
      payload TEXT
    ); PRAGMA user_version=6; COMMIT`);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }

  const listAssets = (): Asset[] =>
    (
      db.prepare("SELECT payload FROM assets ORDER BY patrimony").all() as {
        payload: string;
      }[]
    ).map((row) => {
      const asset: Asset = JSON.parse(row.payload);
      return {
        ...contactFromExtraction(
          asset.contractId ? getContract(asset.contractId)?.extraction : null,
          asset,
        ),
        ...asset,
        brand: asset.brand || "",
        maintenanceDocuments: (
          db
            .prepare(
              "SELECT id,contract_id AS contractId,kind,notes,created_at AS createdAt FROM asset_documents WHERE asset_id=? ORDER BY created_at DESC,rowid DESC",
            )
            .all(asset.id) as Omit<MaintenanceDocument, "name">[]
        ).map((record) => ({
          ...record,
          ...contactFromExtraction(
            getContract(record.contractId)?.extraction,
            asset,
          ),
          name:
            getContract(record.contractId)?.name || "Arquivo de manutenção",
        })),
        coverages: (
          db
            .prepare(
              "SELECT payload FROM asset_contracts WHERE asset_id=? ORDER BY position",
            )
            .all(asset.id) as { payload: string }[]
        ).map((row) => {
          const plan: MaintenanceCoverage = JSON.parse(row.payload);
          return {
            ...contactFromExtraction(
              plan.contractId ? getContract(plan.contractId)?.extraction : null,
              asset,
            ),
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
  function setContractParent(
    id: string,
    parentContractId: string | null,
    documentKind?: "amendment" | "outsourced" | "complement",
  ): Contract {
    const contract = getContract(id);
    if (!contract) throw new DomainError("Arquivo não encontrado.");
    if (documentKind === "amendment" && !parentContractId)
      throw new DomainError("Selecione o Termo de Contrato (TC) principal que este termo aditivo altera.");
    if (
      documentKind &&
      (
        db.prepare("SELECT metadata FROM contracts").all() as {
          metadata: string;
        }[]
      ).some(
        (row) => (JSON.parse(row.metadata) as Contract).parentContractId === id,
      )
    )
      throw new DomainError(
        "Este TC já possui termos aditivos. Reorganize os vínculos antes de alterar o tipo.",
      );
    if (parentContractId) {
      if (id === parentContractId)
        throw new DomainError("Um documento não pode ser termo aditivo de si mesmo.");
      const parent = getContract(parentContractId);
      if (!parent) throw new DomainError("Termo de Contrato (TC) principal não encontrado.");
      if (
        parent.parentContractId ||
        parent.documentKind === "complement" ||
        parent.documentKind === "outsourced"
      )
        throw new DomainError(
          "Selecione um Termo de Contrato (TC), não outro termo aditivo.",
        );
      const hasChildren = (
        db.prepare("SELECT metadata FROM contracts").all() as {
          metadata: string;
        }[]
      ).some(
        (row) => (JSON.parse(row.metadata) as Contract).parentContractId === id,
      );
      if (hasChildren)
        throw new DomainError(
          "Este TC já possui termos aditivos. Reorganize os vínculos antes de associá-lo a outro TC.",
        );
    }
    const updated = {
      ...contract,
      parentContractId,
      documentKind:
        documentKind ??
        (contract.documentKind === "complement" ||
        contract.documentKind === "outsourced"
          ? contract.documentKind
          : parentContractId
            ? ("amendment" as const)
            : ("contract" as const)),
    };
    db.prepare("UPDATE contracts SET metadata=? WHERE id=?").run(
      JSON.stringify(updated),
      id,
    );
    return updated;
  }
  function saveAssets(assets: Asset[], contractUpdate?: { id: string; extraction: Extraction }) {
    db.exec("BEGIN IMMEDIATE");
    try {
      if (contractUpdate) saveExtraction(contractUpdate.id, contractUpdate.extraction);
      for (const asset of assets) {
        const {
          coverages,
          maintenanceDocuments: _documents,
          ...payload
        } = asset;
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
  function attachMaintenanceDocument(
    assetId: string,
    file: { name: string; mime: string; bytes: Buffer },
    input: { kind: MaintenanceDocumentKind; notes?: string },
    extraction?: Extraction,
  ): Asset {
    const data = maintenanceDocumentInput.parse(input);
    db.exec("BEGIN IMMEDIATE");
    try {
      const asset = listAssets().find((item) => item.id === assetId);
      if (!asset) throw new DomainError("Equipamento não encontrado.");
      const documents = asset.maintenanceDocuments || [];
      const baseId =
        asset.contractId ||
        [...(asset.coverages || [])].reverse().find((plan) => plan.contractId)
          ?.contractId;
      const base = baseId ? getContract(baseId) : null;
      const principalId = base?.parentContractId || base?.id || null;
      if (!principalId)
        throw new DomainError(
          "Vincule o equipamento a um Termo de Contrato (TC) antes de adicionar um documento de manutenção.",
        );
      const fileContract = upload(file.name, file.mime, file.bytes);
      const duplicate = documents.find(
        (record) => record.contractId === fileContract.id,
      );
      if (!duplicate) {
        const parentId = principalId;
        if (parentId === fileContract.id)
          throw new DomainError(
            "Este arquivo já é o Termo de Contrato (TC) principal. Selecione o termo aditivo ou o contrato de manutenção.",
          );
        if (
          fileContract.parentContractId &&
          fileContract.parentContractId !== parentId
        )
          throw new DomainError(
            "Este documento está vinculado a outro TC. Organize o vínculo antes de adicioná-lo ao equipamento.",
          );
        if (
          fileContract.documentKind &&
          fileContract.documentKind !== data.kind
        )
          throw new DomainError(
            "Este arquivo já foi salvo com outro tipo de arquivo. Selecione o arquivo correspondente.",
          );
        if (
          !fileContract.parentContractId &&
          listAssets().some(
            (item) =>
              item.contractId === fileContract.id ||
              item.coverages?.some(
                (plan) => plan.contractId === fileContract.id,
              ),
          )
        )
          throw new DomainError(
            "Este arquivo já é um Termo de Contrato (TC) principal. Envie o termo aditivo ou o contrato de manutenção.",
          );
        if (parentId) setContractParent(fileContract.id, parentId);
        const organized = {
          ...getContract(fileContract.id)!,
          documentKind: data.kind,
        };
        db.prepare("UPDATE contracts SET metadata=? WHERE id=?").run(
          JSON.stringify(organized),
          fileContract.id,
        );
        db.prepare(
          "INSERT INTO asset_documents (id,asset_id,contract_id,kind,notes,created_at) VALUES (?,?,?,?,?,?)",
        ).run(
          randomUUID(),
          asset.id,
          fileContract.id,
          data.kind,
          data.notes,
          new Date().toISOString(),
        );
      }
      if (extraction && !fileContract.extraction)
        saveExtraction(fileContract.id, extraction);
      const {
        coverages: _coverages,
        maintenanceDocuments: _documents,
        ...payload
      } = asset;
      db.prepare("UPDATE assets SET payload=? WHERE id=?").run(
        JSON.stringify({
          ...payload,
          maintenanceProvider: "contract",
          updatedAt: new Date().toISOString(),
        }),
        asset.id,
      );
      const updated = listAssets().find((item) => item.id === assetId)!;
      db.exec("COMMIT");
      return updated;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  function getContractBrief(id: string): ContractBriefRecord | null {
    const row = db.prepare("SELECT state,mode,started_at AS startedAt,token,payload FROM contract_briefs WHERE contract_id=?").get(id) as (Omit<ContractBriefRecord, "brief"> & { payload: string | null }) | undefined;
    if (!row) return null;
    const { payload, ...record } = row;
    return { ...record, brief: payload ? JSON.parse(payload) as ContractBrief : null };
  }
  function saveSimulatedBrief(id: string, brief: ContractBrief) {
    db.prepare("INSERT OR IGNORE INTO contract_briefs (contract_id,state,mode,started_at,payload) VALUES (?,'ready','simulated',?,?)")
      .run(id, brief.generatedAt, JSON.stringify(brief));
  }
  function claimContractBrief(id: string, token: string, retry: boolean, now: number) {
    return db.prepare(`INSERT INTO contract_briefs (contract_id,state,mode,started_at,token) VALUES (?,'pending','ai',?,?)
      ON CONFLICT(contract_id) DO UPDATE SET state='pending',mode='ai',started_at=excluded.started_at,token=excluded.token,payload=NULL
      WHERE (contract_briefs.state='ready' AND contract_briefs.mode='simulated')
      OR (?=1 AND (contract_briefs.state='failed' OR (contract_briefs.state='pending' AND contract_briefs.started_at<?)))`)
      .run(id, new Date(now).toISOString(), token, retry ? 1 : 0, new Date(now - 120000).toISOString()).changes === 1;
  }
  function finishContractBrief(id: string, token: string, brief: ContractBrief | null) {
    return db.prepare("UPDATE contract_briefs SET state=?,payload=?,token=NULL WHERE contract_id=? AND token=? AND state='pending'")
      .run(brief ? "ready" : "failed", brief ? JSON.stringify(brief) : null, id, token).changes === 1;
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
      const brand = "Marca demonstrativa";
      const content = Buffer.from(
        `CONTRATO SINTÉTICO — SOMENTE DEMONSTRAÇÃO\nEquipamento: ${name}.\nMarca: ${brand}.\nModelo: ${model}.\nManutenção preventiva a cada ${periodValue} meses desde a instalação.\nData de instalação fictícia: ${anchor(day)}.\nNenhum dado representa um hospital real.`,
      );
      const contract = upload(
        `contrato-sintetico-${patrimony.toLowerCase()}.txt`,
        "text/plain",
        content,
      );
      saveAsset({
        id: randomUUID(),
        name,
        brand,
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
    setContractParent,
    attachMaintenanceDocument,
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
    getContractBrief,
    saveSimulatedBrief,
    claimContractBrief,
    finishContractBrief,
    getBytes,
    close: () => db.close(),
  };
}
