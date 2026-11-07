import type { Asset, EquipmentExtraction, MultiEquipmentExtraction } from "./types.js";

/** Referência provisória do cadastro, distinta de tombamento ou série. */
export function equipmentTombamentoLabel(asset: Pick<Asset, "patrimony" | "importSource">): string {
  if (asset.patrimony) return asset.patrimony;
  const source = asset.importSource;
  return source?.position && source.total && source.total > 1
    ? `pendente · Unidade ${source.position} de ${source.total}` : "pendente";
}

const value = (field?: { status: string; value: string | null }) =>
  field?.status === "found" ? (field.value || "").trim() : "";

/** Leituras antigas podem descrever o comportamento anterior, de manter um grupo. */
export function equipmentImportWarnings(data: MultiEquipmentExtraction): string[] {
  const expanded = data.equipments.some(item =>
    (item.importUnit?.total || 0) > 1 ||
    (!value(item.patrimony) && !value(item.serial) && Number(value(item.quantity)) > 1));
  return data.warnings.map(warning => expanded &&
    /retornad[oa] (?:um|1) item de grupo|sem criar unidades/i.test(warning)
      ? "O documento descreve equipamentos em grupo. As unidades foram separadas para conferência, com identificação individual pendente."
      : warning);
}

/** A IA descreve o grupo uma vez; unidades de cadastro são montadas localmente. */
export function expandEquipmentGroups(
  data: MultiEquipmentExtraction,
): MultiEquipmentExtraction {
  const equipments: EquipmentExtraction[] = [];
  for (const [groupIndex, item] of data.equipments.entries()) {
    if (item.importUnit) {
      equipments.push(item);
      continue;
    }
    const quantity = value(item.quantity);
    const count = /^\d+$/.test(quantity) ? Number(quantity) : 1;
    if (!Number.isSafeInteger(count) || count < 1)
      throw new Error("Quantidade de equipamentos inválida. Confira o documento antes de importar.");
    const identified = Boolean(value(item.patrimony) || value(item.serial));
    // Um identificador individual nunca é copiado para outras máquinas.
    const total = !identified && Number.isSafeInteger(count) && count > 1
      ? count : 1;
    if (total > 50 || equipments.length + total > 50)
      throw new Error("O documento ultrapassa 50 equipamentos. Divida a importação em lotes menores.");
    const groupKey = JSON.stringify([
      groupIndex, value(item.equipment), value(item.brand), value(item.model),
      value(item.sector), quantity, item.quantity.page, item.quantity.quote,
    ]);
    for (let position = 1; position <= total; position++) {
      equipments.push({
        ...item,
        // Quantidade e evidências originais permanecem intactas.
        importUnit: { key: `${groupKey}:${position}`, position, total },
        warnings: identified && count > 1
          ? [...item.warnings, "Quantidade do lote acompanhada de identificador individual: confira as demais unidades antes de incluí-las."]
          : [...item.warnings],
      });
    }
  }
  if (equipments.length > 50)
    throw new Error("O documento ultrapassa 50 equipamentos. Divida a importação em lotes menores.");
  return { ...data, equipments, warnings: equipmentImportWarnings(data) };
}
