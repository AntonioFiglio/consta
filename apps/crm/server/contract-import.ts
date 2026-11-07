import { assetInput, DomainError, prepareAsset } from "./domain.js";
import { draftFromExtraction, extractionItems, existingForDraft } from "../src/contract-extraction.js";
import type { ContractImportResult, Extraction, MultiEquipmentExtraction } from "../src/types.js";
import type { createStore } from "./store.js";

/** Cadastro documental automático; aprovar manutenção continua sendo outra decisão. */
export function importContractEquipment(
  store: ReturnType<typeof createStore>,
  contractId: string,
  extraction?: Extraction,
): ContractImportResult {
  const contract = store.getContract(contractId);
  if (!contract) throw new DomainError("Termo de Contrato (TC) não encontrado.");
  if (contract.parentContractId || (contract.documentKind && contract.documentKind !== "contract"))
    throw new DomainError("Use o Termo de Contrato (TC) principal para cadastrar os equipamentos.");
  const data = extraction || contract.extraction;
  if (!data) throw new DomainError("O TC foi salvo, mas ainda precisa ser lido para cadastrar os equipamentos.");
  const equipments = extractionItems(data);
  if (!equipments.length)
    throw new DomainError("O TC foi salvo, mas nenhum equipamento foi identificado. Complete o cadastro manualmente ou confira o documento.");
  const normalized: MultiEquipmentExtraction = { version: 2, equipments, warnings: data.warnings };
  const known = store.listAssets();
  let createdCount = 0;
  const assets = equipments.map((item, index) => {
    const draft = draftFromExtraction(item, `import:${index}`);
    const existing = existingForDraft(draft, known, contractId);
    if (existing) {
      if (existing.contractId !== contractId)
        throw new DomainError(`O equipamento ${existing.patrimony || existing.name} já pertence a outro TC. Confira o vínculo antes de importar.`);
      // Reenvio não desfaz correções humanas nem aprova um plano novamente.
      return existing;
    }
    createdCount++;
    const period = Number(draft.periodValue);
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.maintenanceEmail)
      ? draft.maintenanceEmail : "";
    return prepareAsset(undefined, assetInput.parse({
      name: draft.name || "Equipamento a identificar",
      brand: draft.brand, model: draft.model, patrimony: draft.patrimony,
      serial: draft.serial, sector: draft.sector, notes: draft.notes,
      maintenanceCompany: draft.maintenanceCompany,
      maintenancePhone: draft.maintenancePhone, maintenanceEmail: email,
      maintenanceProvider: draft.maintenanceCompany ? "contract" : "unassigned",
      contractId,
      importSource: item.importUnit ? {
        contractId, unitKey: item.importUnit.key,
        position: item.importUnit.position, total: item.importUnit.total,
      } : undefined,
      periodValue: Number.isInteger(period) && period >= 1 && period <= 366 ? period : null,
      periodUnit: draft.periodUnit, anchorDate: draft.anchorDate || null,
      anchorType: draft.anchorType, firstDueDate: draft.firstDueDate || null,
      validFrom: draft.validFrom || null, validUntil: draft.validUntil || null,
      reviewed: false,
    }));
  });
  const ids = assets.map(asset => asset.id);
  if (new Set(ids).size !== ids.length)
    throw new DomainError("A leitura repete o mesmo equipamento. Confira os identificadores do TC antes de cadastrar o lote.");
  // Metadados/evidências e fichas são gravados na mesma transação.
  store.saveAssets(assets, { id: contractId, extraction: normalized });
  const saved = store.listAssets();
  return {
    contract: store.getContract(contractId)!,
    assets: ids.map(id => saved.find(asset => asset.id === id)!),
    createdCount, existingCount: assets.length - createdCount,
  };
}
