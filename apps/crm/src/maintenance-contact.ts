import type {
  Asset,
  EquipmentExtraction,
  Extraction,
  MaintenanceContact,
} from "./types.js";
import { maintenanceProviderFor } from "./maintenance-status.js";

const value = (field?: { status: string; value: string | null }) =>
  field?.status === "found" ? (field.value || "").trim() : "";
const key = (text?: string) => (text || "").trim().toLocaleLowerCase("pt-BR");
export function contactFromExtraction(
  extraction: Extraction | null | undefined,
  asset: Asset,
): MaintenanceContact {
  if (!extraction || !("equipments" in extraction)) return {};
  const items = extraction.equipments;
  const item =
    items.find(
      (item) =>
        Boolean(asset.patrimony) &&
        key(value(item.patrimony)) === key(asset.patrimony),
    ) ||
    items.find(
      (item) =>
        Boolean(asset.serial) && key(value(item.serial)) === key(asset.serial),
    ) ||
    items.find(
      (item) =>
        !value(item.patrimony) &&
        !value(item.serial) &&
        key(value(item.equipment)) === key(asset.name) &&
        (!value(item.model) || key(value(item.model)) === key(asset.model)),
    );
  const contact = (item: EquipmentExtraction): MaintenanceContact => ({
    maintenanceCompany: value(item.maintenanceCompany),
    maintenancePhone: value(item.maintenancePhone),
    maintenanceEmail: value(item.maintenanceEmail),
  });
  if (item) return contact(item);
  // Só usa contato comum quando todos os itens do documento o confirmam.
  if (items.length > 1) {
    const shared = contact(items[0]);
    if (
      Object.values(shared).some(Boolean) &&
      items.every(
        (item) => JSON.stringify(contact(item)) === JSON.stringify(shared),
      )
    )
      return shared;
  }
  return {};
}

export function maintenanceContactFor(
  asset: Asset,
): MaintenanceContact & { name: string; contractId: string | null } {
  const provider = maintenanceProviderFor(asset);
  if (provider !== "contract")
    return {
      name:
        provider === "internal"
          ? "Oficina do hospital"
          : "Responsável não definido",
      contractId: null,
    };
  const candidates = [
    ...(asset.coverages || [])
      .filter((plan) => plan.contractId)
      .map((plan) => ({
        ...plan,
        contractId: plan.contractId!,
        date: plan.createdAt,
        source: 0,
      })),
    ...(asset.maintenanceDocuments || [])
      .filter((record) => record.kind !== "complement")
      .map((record) => ({ ...record, date: record.createdAt, source: 1 })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.source - a.source);
  const latest = candidates[0];
  // Dados do cadastro são a revisão humana do documento atual, nunca de um vínculo anterior.
  const contact =
    latest?.contractId === asset.contractId || !latest ? asset : latest;
  return {
    maintenanceCompany: contact.maintenanceCompany,
    maintenancePhone: contact.maintenancePhone,
    maintenanceEmail: contact.maintenanceEmail,
    name: contact.maintenanceCompany?.trim() || "Empresa de manutenção",
    contractId: latest?.contractId || asset.contractId,
  };
}

export function phoneLink(phone?: string): string | null {
  const match = phone
    ?.trim()
    .match(
      /^(\+?[\d().\s-]+?)(?:\s*(?:ramal|ext\.?|extens[aã]o)\s*:?\s*(\d{1,8}))?$/i,
    );
  if (!match) return null;
  const digits = match[1].replace(/[^+\d]/g, "");
  return /^\+?\d{7,15}$/.test(digits)
    ? `tel:${digits}${match[2] ? `;ext=${match[2]}` : ""}`
    : null;
}
export function emailLink(email?: string): string | null {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? `mailto:${encodeURIComponent(email)}`
    : null;
}
