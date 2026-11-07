import type { Asset, ContractSummary } from "./types.js";

export const assetHasDocument = (asset: Asset, ids: ReadonlySet<string>) =>
  Boolean(
    (asset.contractId && ids.has(asset.contractId)) ||
    asset.maintenanceDocuments?.some((record) => ids.has(record.contractId)) ||
    asset.coverages?.some(
      (plan) => plan.contractId && ids.has(plan.contractId),
    ),
  );
export function contractDocumentIds(
  id: string,
  contracts: ContractSummary[],
): Set<string> {
  return new Set([
    id,
    ...contracts
      .filter((contract) => contract.parentContractId === id)
      .map((contract) => contract.id),
  ]);
}

/** Resolve a família somente por vínculos explícitos; abrir um filho preserva a seleção. */
export function contractFamily(id: string, contracts: ContractSummary[]) {
  const index = new Map(contracts.map(document => [document.id, document]));
  const selected = index.get(id);
  if (!selected) return { selected: undefined, principal: undefined, documents: [] as ContractSummary[] };
  let principal = selected;
  const visited = new Set([principal.id]);
  while (principal.parentContractId) {
    const parent = index.get(principal.parentContractId);
    if (!parent || visited.has(parent.id)) break;
    principal = parent;
    visited.add(parent.id);
  }
  const children = contracts.filter(document => document.parentContractId === principal.id && document.id !== principal.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name, "pt-BR"));
  return { selected, principal, documents: [principal, ...children] };
}
export function groupContracts(
  contracts: ContractSummary[],
  assets: Asset[],
  query = "",
) {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const index = new Map(contracts.map((contract) => [contract.id, contract]));
  return contracts
    .filter(
      (contract) =>
        !contract.parentContractId || !index.has(contract.parentContractId),
    )
    .map((principal) => {
      const amendments = contracts
        .filter((contract) => contract.parentContractId === principal.id)
        .sort(
          (a, b) =>
            a.createdAt.localeCompare(b.createdAt) ||
            a.name.localeCompare(b.name, "pt-BR"),
        );
      const ids = new Set([
        principal.id,
        ...amendments.map((contract) => contract.id),
      ]);
      const units = assets.filter((asset) => assetHasDocument(asset, ids));
      const matches =
        !normalized ||
        `${principal.name} ${amendments.map((contract) => contract.name).join(" ")} ${units.map((asset) => `${asset.name} ${asset.brand || ""} ${asset.model} ${asset.patrimony} ${asset.serial} ${asset.sector}`).join(" ")}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      return { principal, amendments, units, matches };
    })
    .filter((group) => group.matches);
}

export function documentKindLabel(
  document: Pick<ContractSummary, "documentKind" | "parentContractId">,
): string {
  if (document.documentKind === "outsourced")
    return "Contrato terceirizado";
  return document.documentKind === "complement"
    ? "Anexo"
    : document.parentContractId
      ? "Termo aditivo"
      : "Contrato principal";
}
