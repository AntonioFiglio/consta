import type {
  Asset,
  Evidence,
  Extraction,
  EquipmentExtraction,
  PeriodUnit,
} from "./types.js";
import { nextOccurrence, occurrence } from "./schedule.js";

export type EquipmentDraft = {
  assetId?: string;
  key: string;
  name: string;
  patrimony: string;
  serial: string;
  sector: string;
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
  if (isMultiExtraction(data)) return data.equipments;
  return [
    {
      ...data,
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
    name: value(item.equipment),
    patrimony: value(item.patrimony),
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
    name: asset.name,
    patrimony: asset.patrimony,
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
): Asset | undefined {
  if (row.assetId) return assets.find((asset) => asset.id === row.assetId);
  const patrimony = row.patrimony.trim().toLocaleUpperCase("pt-BR");
  return patrimony
    ? assets.find(
        (asset) => asset.patrimony.toLocaleUpperCase("pt-BR") === patrimony,
      )
    : undefined;
}
