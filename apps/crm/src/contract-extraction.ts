import type {
  Asset,
  Evidence,
  Extraction,
  EquipmentExtraction,
  PeriodUnit,
} from "./types.js";
import { nextOccurrence, occurrence } from "./schedule.js";
import { expandEquipmentGroups } from "./equipment-import.js";

export type EquipmentDraft = {
  importUnit?: EquipmentExtraction["importUnit"];
  importSource?: Asset["importSource"];
  assetId?: string;
  key: string;
  name: string;
  patrimony: string;
  serial: string;
  sector: string;
  brand: string;
  maintenanceCompany: string;
  maintenancePhone: string;
  maintenanceEmail: string;
  model: string;
  notes: string;
  periodValue: string;
  periodUnit: PeriodUnit;
  firstDueDate: string;
  anchorDate: string;
  anchorType: string;
  validFrom: string;
  validUntil: string;
  quantity: string;
  evidence?: EquipmentExtraction;
};
export const evidenceValue = (field?: Evidence) =>
  field?.status === "found" ? field.value || "" : "";
export function evidenceDate(field?: Evidence): string {
  const date = evidenceValue(field);
  const parsed = new Date(date + "T12:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
    ? date
    : "";
}
export const isMultiExtraction = (
  data: Extraction,
): data is Extract<Extraction, { version: 2 }> => "equipments" in data;
const missing: Evidence = {
  value: null,
  status: "missing",
  page: null,
  quote: null,
};
export function extractionItems(data: Extraction): EquipmentExtraction[] {
  if (isMultiExtraction(data))
    return expandEquipmentGroups(data).equipments.map((item) => ({
      ...item,
      brand: item.brand || missing,
      maintenanceCompany: item.maintenanceCompany || missing,
      maintenancePhone: item.maintenancePhone || missing,
      maintenanceEmail: item.maintenanceEmail || missing,
    }));
  return [
    {
      ...data,
      brand: missing,
      patrimony: missing,
      serial: missing,
      sector: missing,
      notes: missing,
      quantity: missing,
      firstDueDate: missing,
    },
  ];
}
export function draftFromExtraction(
  item: EquipmentExtraction,
  key: string,
): EquipmentDraft {
  const value = evidenceValue;
  const periodValue =
    /^\d+$/.test(value(item.periodValue)) &&
    ["days", "months", "years"].includes(value(item.periodUnit))
      ? value(item.periodValue)
      : "";
  const periodUnit = (
    ["days", "months", "years"].includes(value(item.periodUnit))
      ? value(item.periodUnit)
      : "months"
  ) as PeriodUnit;
  const validFrom = evidenceDate(item.validFrom);
  let anchorDate = value(item.anchorType) ? evidenceDate(item.anchorDate) : "";
  const explicitFirst = evidenceDate(item.firstDueDate);
  const firstDueDate =
    explicitFirst ||
    (anchorDate && periodValue
      ? validFrom
        ? nextOccurrence(anchorDate, Number(periodValue), periodUnit, validFrom)
        : occurrence(anchorDate, Number(periodValue), periodUnit, 1)
      : "");
  if (
    explicitFirst &&
    anchorDate &&
    periodValue &&
    nextOccurrence(
      anchorDate,
      Number(periodValue),
      periodUnit,
      explicitFirst,
    ) !== explicitFirst
  )
    anchorDate = "";
  return {
    key,
    importUnit: item.importUnit,
    name: value(item.equipment),
    patrimony: value(item.patrimony),
    brand: value(item.brand),
    maintenanceCompany: value(item.maintenanceCompany),
    maintenancePhone: value(item.maintenancePhone),
    maintenanceEmail: value(item.maintenanceEmail),
    model: value(item.model),
    serial: value(item.serial),
    sector: value(item.sector),
    notes: value(item.notes),
    quantity: value(item.quantity),
    periodValue,
    periodUnit,
    firstDueDate,
    anchorDate,
    anchorType: anchorDate ? value(item.anchorType) : "Primeira manutenção",
    validFrom,
    validUntil: evidenceDate(item.validUntil),
    evidence: item,
  };
}
export function emptyDraft(key: string): EquipmentDraft {
  return {
    key,
    name: "",
    patrimony: "",
    serial: "",
    brand: "",
    maintenanceCompany: "",
    maintenancePhone: "",
    maintenanceEmail: "",
    model: "",
    sector: "",
    notes: "",
    quantity: "",
    periodValue: "",
    periodUnit: "months",
    firstDueDate: "",
    anchorDate: "",
    anchorType: "Primeira manutenção",
    validFrom: "",
    validUntil: "",
  };
}
export function draftFromAsset(asset: Asset): EquipmentDraft {
  return {
    ...emptyDraft(asset.id),
    assetId: asset.id,
    importSource: asset.importSource,
    name: asset.name,
    patrimony: asset.patrimony,
    brand: asset.brand || "",
    maintenanceCompany: asset.maintenanceCompany || "",
    maintenancePhone: asset.maintenancePhone || "",
    maintenanceEmail: asset.maintenanceEmail || "",
    model: asset.model,
    serial: asset.serial,
    sector: asset.sector,
    notes: asset.notes,
    periodValue: String(asset.periodValue || ""),
    periodUnit: asset.periodUnit,
    anchorDate: asset.anchorDate || "",
    anchorType: asset.anchorType,
    firstDueDate:
      asset.firstDueDate ||
      (asset.anchorDate && asset.periodValue
        ? occurrence(asset.anchorDate, asset.periodValue, asset.periodUnit, 1)
        : ""),
    validFrom: asset.validFrom || "",
    validUntil: asset.validUntil || "",
  };
}

export function existingForDraft(
  row: EquipmentDraft,
  assets: Asset[],
  contractId?: string,
): Asset | undefined {
  if (row.assetId) return assets.find((asset) => asset.id === row.assetId);
  if (contractId && row.importUnit) {
    const imported = assets.find((asset) =>
      asset.importSource?.contractId === contractId &&
      asset.importSource.unitKey === row.importUnit!.key);
    if (imported) return imported;
  }
  const patrimony = row.patrimony.trim().toLocaleUpperCase("pt-BR");
  return patrimony
    ? assets.find(
        (asset) => asset.patrimony.toLocaleUpperCase("pt-BR") === patrimony,
      )
    : undefined;
}
