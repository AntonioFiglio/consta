import { equipmentExtractionSchema } from "../../server/extraction.js";
import type { EquipmentExtraction, MultiEquipmentExtraction } from "../../src/types.js";

const absent = { value: null, status: "missing" as const, page: null, quote: null };
export const documented = (value: string) => ({ value, status: "found" as const, page: 2, quote: value });
export function importEquipment(patch: Partial<EquipmentExtraction> = {}): EquipmentExtraction {
  return {
    ...Object.fromEntries(Object.keys(equipmentExtractionSchema.shape).map(key => [key, absent])),
    equipment: documented("Ecocardiógrafo sintético"), brand: documented("Marca sintética"),
    model: documented("Modelo sintético"), quantity: documented("6"),
    maintenanceCompany: documented("Assistência sintética"),
    maintenancePhone: documented("(11) 5555-0123"), maintenanceEmail: documented("assistencia@example.test"),
    sector: documented("Setor de teste"), notes: documented("Condição de teste documentada"),
    periodValue: documented("6"), periodUnit: documented("months"),
    anchorDate: documented("2026-01-10"), anchorType: documented("Instalação"),
    warnings: [], ...patch,
  } as EquipmentExtraction;
}
export const importBatch = (equipments = [importEquipment()]): MultiEquipmentExtraction => ({ version: 2, equipments, warnings: [] });
