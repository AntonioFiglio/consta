import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../server/store.js";
import { assetInput, prepareAsset } from "../server/domain.js";
import { extractionSchema } from "../server/extraction.js";
import {
  draftFromExtraction,
  extractionItems,
} from "../src/contract-extraction.js";
import {
  maintenanceContactFor,
  contactFromExtraction,
  phoneLink,
  emailLink,
} from "../src/maintenance-contact.js";
import type {
  EquipmentExtraction,
  Evidence,
  MultiEquipmentExtraction,
} from "../src/types.js";
const missing: Evidence = {
  value: null,
  status: "missing",
  page: null,
  quote: null,
};
const found = (value: string): Evidence => ({
  value,
  status: "found",
  page: 1,
  quote: value,
});
const input = (contractId: string | null = null) =>
  assetInput.parse({
    name: "Monitor sintético",
    patrimony: "CONTATO-01",
    contractId,
    periodValue: null,
    periodUnit: "months",
    anchorDate: null,
    reviewed: false,
    maintenanceProvider: "contract",
    maintenanceCompany: "Empresa anterior",
    maintenancePhone: "(11) 5555-0100",
    maintenanceEmail: "anterior@example.test",
  });
const item = (
  patch: Partial<EquipmentExtraction> = {},
): EquipmentExtraction => ({
  ...extractionItems({
    equipment: found("Monitor sintético"),
    model: missing,
    periodValue: missing,
    periodUnit: missing,
    anchorDate: missing,
    anchorType: missing,
    warnings: [],
  })[0],
  validFrom: missing,
  validUntil: missing,
  patrimony: found("CONTATO-01"),
  maintenanceCompany: found("Empresa nova"),
  maintenancePhone: found("(11) 5555-0200"),
  maintenanceEmail: found("nova@example.test"),
  ...patch,
});
const extraction = (items = [item()]): MultiEquipmentExtraction => ({
  version: 2,
  equipments: items,
  warnings: [],
});

test("IA preenche os três contatos por equipamento com evidência e mantém ausência/conflito sem dedução", () => {
  const parsed = extractionSchema.parse(extraction());
  const draft = draftFromExtraction(parsed.equipments[0], "linha");
  assert.equal(draft.maintenanceCompany, "Empresa nova");
  assert.equal(draft.maintenancePhone, "(11) 5555-0200");
  assert.equal(draft.maintenanceEmail, "nova@example.test");
  const absent = draftFromExtraction(
    item({
      maintenanceCompany: missing,
      maintenancePhone: missing,
      maintenanceEmail: {
        ...missing,
        status: "conflict",
        quote: "Dois contatos diferentes",
      },
    }),
    "ausente",
  );
  assert.equal(absent.maintenanceCompany, "");
  assert.equal(absent.maintenancePhone, "");
  assert.equal(absent.maintenanceEmail, "");
  const asset = prepareAsset(undefined, input());
  const multiple = extraction([
    item(),
    item({
      patrimony: found("CONTATO-02"),
      maintenanceCompany: found("Outra assistência"),
      maintenancePhone: missing,
    }),
  ]);
  assert.equal(
    contactFromExtraction(multiple, asset).maintenanceCompany,
    "Empresa nova",
  );
  assert.deepEqual(
    contactFromExtraction(multiple, {
      ...asset,
      patrimony: "DESCONHECIDO",
      name: "Outro equipamento",
    }),
    {},
  );
});

test("quem atende usa o vínculo mais recente e não reaproveita telefone ou empresa anteriores se faltarem", () => {
  const asset = prepareAsset(undefined, input());
  asset.maintenanceDocuments = [
    {
      id: "old",
      contractId: "old",
      name: "anterior",
      kind: "amendment",
      notes: "",
      createdAt: "2026-01-01T00:00:00Z",
      maintenanceCompany: "Empresa antiga",
    },
    {
      id: "latest",
      contractId: "latest",
      name: "atual",
      kind: "outsourced",
      notes: "",
      createdAt: "2027-01-01T00:00:00Z",
      maintenanceCompany: "Empresa atual",
      maintenanceEmail: "atual@example.test",
    },
  ];
  assert.equal(maintenanceContactFor(asset).name, "Empresa atual");
  assert.equal(maintenanceContactFor(asset).contractId, "latest");
  assert.equal(maintenanceContactFor(asset).maintenancePhone, undefined);
  asset.maintenanceDocuments[1].maintenanceCompany = "";
  assert.equal(maintenanceContactFor(asset).name, "Empresa de manutenção");
  assert.equal(
    maintenanceContactFor({ ...asset, maintenanceProvider: "internal" }).name,
    "Oficina do hospital",
  );
  assert.equal(
    maintenanceContactFor({ ...asset, maintenanceProvider: "internal" })
      .maintenanceEmail,
    undefined,
  );
});

test("contatos persistem no cadastro e no novo documento, sem alterar cobertura e mantendo clientes antigos", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-contact-"));
  const database = join(directory, "test.sqlite");
  let store = createStore(database);
  try {
    const principal = store.upload(
      "origem.txt",
      "text/plain",
      Buffer.from("Origem sintética"),
    );
    store.saveAsset(prepareAsset(undefined, input(principal.id)));
    const before = store.listAssets()[0];
    const withExternal = store.attachMaintenanceDocument(
      before.id,
      {
        name: "externo.txt",
        mime: "text/plain",
        bytes: Buffer.from("Contrato externo sintético"),
      },
      { kind: "outsourced" },
      extraction(),
    );
    assert.equal(maintenanceContactFor(withExternal).name, "Empresa nova");
    assert.equal(
      maintenanceContactFor(withExternal).maintenanceEmail,
      "nova@example.test",
    );
    assert.deepEqual(withExternal.coverages, before.coverages);
    assert.equal(withExternal.contractId, before.contractId);
    const {
      maintenanceCompany: _company,
      maintenancePhone: _phone,
      maintenanceEmail: _email,
      ...oldClient
    } = withExternal;
    store.saveAsset(prepareAsset(withExternal, assetInput.parse(oldClient)));
    store.close();
    store = createStore(database);
    const reloaded = store.listAssets()[0];
    assert.equal(reloaded.maintenanceCompany, "Empresa anterior");
    assert.equal(maintenanceContactFor(reloaded).name, "Empresa nova");
    assert.equal(
      maintenanceContactFor(reloaded).maintenancePhone,
      "(11) 5555-0200",
    );
    assert.equal(
      store.getContract(reloaded.maintenanceDocuments![0].contractId)
        ?.extraction?.warnings.length,
      0,
    );
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("links de telefone e e-mail não aceitam protocolos ou quebras de linha vindas do documento", () => {
  assert.equal(phoneLink("(11) 5555-0100"), "tel:1155550100");
  assert.equal(phoneLink("javascript:alert(1)"), null);
  assert.equal(phoneLink("(11) 5555-0100 ramal 22"), "tel:1155550100;ext=22");
  assert.equal(phoneLink("(11) 5555-0100 / (11) 5555-0200"), null);
  assert.equal(
    emailLink("contato@example.test"),
    "mailto:contato%40example.test",
  );
  assert.equal(emailLink("contato@example.test\nBcc:outra@example.test"), null);
  assert.equal(
    assetInput.safeParse({ ...input(), maintenanceEmail: "não é e-mail" })
      .success,
    false,
  );
});
