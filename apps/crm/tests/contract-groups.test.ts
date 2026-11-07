import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createStore } from "../server/store.js";
import {
  groupContracts,
  contractFamily,
  contractDocumentIds,
  assetHasDocument,
} from "../src/contract-groups.js";
import type { Asset, ContractSummary } from "../src/types.js";

const document = (
  name: string,
  parentContractId?: string,
): ContractSummary => ({
  id: randomUUID(),
  name,
  mime: "text/plain",
  createdAt: "2026-11-07T00:00:00Z",
  ...(parentContractId ? { parentContractId } : {}),
});

test("vínculo de aditivo persiste sem modificar arquivo, equipamentos ou deduplicação", () => {
  const directory = mkdtempSync(join(tmpdir(), "consta-contract-tree-"));
  let store = createStore(join(directory, "test.sqlite"));
  try {
    const main = store.upload(
      "principal.txt",
      "text/plain",
      Buffer.from("Contrato principal sintético"),
    );
    const bytes = Buffer.from("Primeiro termo aditivo sintético");
    const amendment = store.upload("aditivo.txt", "text/plain", bytes);
    store.setContractParent(amendment.id, main.id);
    assert.equal(
      store.upload("reenvio.txt", "text/plain", bytes).parentContractId,
      main.id,
    );
    store.close();
    store = createStore(join(directory, "test.sqlite"));
    assert.equal(store.getContract(amendment.id)?.parentContractId, main.id);
    assert.equal(
      store.listContracts().find((item) => item.id === amendment.id)
        ?.parentContractId,
      main.id,
    );
    assert.deepEqual(store.getBytes(amendment.id), bytes);
    assert.equal(store.listAssets().length, 0);
    store.setContractParent(amendment.id, null);
    assert.equal(store.getContract(amendment.id)?.parentContractId, null);
    assert.deepEqual(store.getBytes(amendment.id), bytes);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("impede ciclos, pai inexistente e aditivo dentro de aditivo; permite mover e desvincular", () => {
  const store = createStore(":memory:");
  try {
    const main = store.upload(
      "principal.txt",
      "text/plain",
      Buffer.from("Principal"),
    );
    const other = store.upload(
      "outro.txt",
      "text/plain",
      Buffer.from("Outro principal"),
    );
    const child = store.upload(
      "aditivo.txt",
      "text/plain",
      Buffer.from("Aditivo"),
    );
    const third = store.upload(
      "novo.txt",
      "text/plain",
      Buffer.from("Novo aditivo"),
    );
    assert.throws(() => store.setContractParent(main.id, main.id), /si mesmo/);
    assert.throws(
      () => store.setContractParent(child.id, randomUUID()),
      /principal não encontrado/,
    );
    assert.throws(
      () => store.setContractParent(randomUUID(), main.id),
      /Arquivo não encontrado/,
    );
    store.setContractParent(child.id, main.id);
    assert.throws(
      () => store.setContractParent(third.id, child.id),
      /outro aditivo/,
    );
    assert.throws(
      () => store.setContractParent(main.id, other.id),
      /já possui aditivos/,
    );
    assert.throws(() => store.setContractParent(main.id, child.id));
    assert.equal(store.getContract(main.id)?.parentContractId, undefined);
    store.setContractParent(child.id, other.id);
    assert.equal(store.getContract(child.id)?.parentContractId, other.id);
    store.setContractParent(child.id, null);
    store.setContractParent(main.id, other.id);
    assert.equal(store.getContract(main.id)?.parentContractId, other.id);
  } finally {
    store.close();
  }
});

test("busca por aditivo ou tombamento mantém o principal e reúne unidades sem duplicar", () => {
  const main = document("Contrato principal");
  const child = document("Termo de prorrogação", main.id);
  const sibling = document("Aditivo de valor", main.id);
  const unrelated = document("Outro contrato");
  const documents = [child, unrelated, sibling, main];
  const unit = {
    id: "unit",
    name: "Bomba sintética",
    patrimony: "SINT-42",
    serial: "S42",
    sector: "UTI",
    contractId: main.id,
    coverages: [{ contractId: child.id }],
  } as Asset;
  const groups = groupContracts(documents, [unit], "prorrogação");
  assert.equal(groups.length, 1);
  assert.equal(groups[0].principal.id, main.id);
  assert.equal(groups[0].amendments.length, 2);
  assert.equal(groups[0].units.length, 1);
  assert.equal(
    groupContracts(documents, [unit], "sint-42")[0].principal.id,
    main.id,
  );
  const ids = contractDocumentIds(main.id, documents);
  assert.deepEqual(ids, new Set([main.id, child.id, sibling.id]));
  assert.equal(
    assetHasDocument({ ...unit, contractId: child.id, coverages: [] }, ids),
    true,
  );
  assert.equal(
    assetHasDocument({ ...unit, contractId: unrelated.id, coverages: [] }, ids),
    false,
  );
});

test("arquivo antigo permanece principal; nome aditivo não cria vínculo por suposição", () => {
  const first = document("aditivo-sem-vinculo.txt");
  const second = document("principal.txt");
  assert.equal(groupContracts([first, second], []).length, 2);
  const orphan = document("referencia ausente", randomUUID());
  assert.equal(groupContracts([orphan], [])[0].principal.id, orphan.id);
});


test("abrir principal, aditivo ou terceirizado mantém a mesma família e o arquivo selecionado", () => {
  const main = document("Principal");
  const amendment = document("Aditivo", main.id);
  const outsourced = { ...document("Terceirizado", main.id), documentKind: "outsourced" as const };
  const other = document("Outro principal");
  const source = [outsourced, other, amendment, main];
  for (const entry of [main, amendment, outsourced]) {
    const result = contractFamily(entry.id, source);
    assert.equal(result.principal?.id, main.id);
    assert.equal(result.selected?.id, entry.id);
    assert.deepEqual(new Set(result.documents.map(item => item.id)), new Set([main.id, amendment.id, outsourced.id]));
  }
  assert.equal(contractFamily("ausente", source).documents.length, 0);
  assert.equal(contractFamily(other.id, source).documents.length, 1);
});

test("família sem principal disponível mantém o arquivo acessível e não infere relações", () => {
  const orphan = document("Aditivo órfão", randomUUID());
  const other = document("Outro");
  assert.deepEqual(contractFamily(orphan.id, [orphan, other]).documents.map(item => item.id), [orphan.id]);
});

test("tipo de arquivo vinculado persiste sem alterar bytes e impede aditivo sem origem", () => {
  const store = createStore(":memory:");
  try {
    const main = store.upload("principal.txt", "text/plain", Buffer.from("Principal sintético"));
    for (const kind of ["outsourced", "amendment", "complement"] as const) {
      const bytes = Buffer.from(`Arquivo sintético ${kind}`);
      const child = store.upload(`${kind}.txt`, "text/plain", bytes);
      const updated = store.setContractParent(child.id, main.id, kind);
      assert.equal(updated.documentKind, kind);
      assert.equal(store.getContract(child.id)?.documentKind, kind);
      assert.equal(store.getContract(child.id)?.parentContractId, main.id);
      assert.deepEqual(store.getBytes(child.id), bytes);
      assert.equal(contractFamily(child.id, store.listContracts()).principal?.id, main.id);
    }
    const orphan = store.upload("orfao.txt", "text/plain", Buffer.from("Outro arquivo"));
    assert.throws(() => store.setContractParent(orphan.id, null, "amendment"), /principal/);
    assert.throws(() => store.setContractParent(main.id, null, "outsourced"), /possui aditivos/);
    assert.equal(store.listAssets().length, 0);
  } finally { store.close(); }
});
