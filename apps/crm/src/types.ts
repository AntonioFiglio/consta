export type PeriodUnit = "days" | "months" | "years";
export type Evidence = {
  value: string | null;
  status: "found" | "missing" | "conflict";
  page: number | null;
  quote: string | null;
};
export type LegacyExtraction = {
  equipment: Evidence;
  model: Evidence;
  periodValue: Evidence;
  periodUnit: Evidence;
  anchorDate: Evidence;
  anchorType: Evidence;
  validFrom?: Evidence;
  validUntil?: Evidence;
  warnings: string[];
};
export type EquipmentExtraction = LegacyExtraction & {
  patrimony: Evidence;
  serial: Evidence;
  sector: Evidence;
  notes: Evidence;
  quantity: Evidence;
  firstDueDate: Evidence;
};
export type MultiEquipmentExtraction = {
  version: 2;
  equipments: EquipmentExtraction[];
  warnings: string[];
};
export type Extraction = LegacyExtraction | MultiEquipmentExtraction;
export type Contract = {
  id: string;
  name: string;
  mime: string;
  createdAt: string;
  extraction: Extraction | null;
};
export type MaintenanceProvider = "contract" | "internal" | "unassigned";
export type Asset = {
  maintenanceProvider?: MaintenanceProvider;
  id: string;
  name: string;
  model: string;
  patrimony: string;
  serial: string;
  sector: string;
  contractId: string | null;
  contractName?: string | null;
  periodValue: number | null;
  periodUnit: PeriodUnit;
  anchorDate: string | null;
  anchorType: string;
  reviewed: boolean;
  notes: string;
  simulated: boolean;
  updatedAt: string;
  firstDueDate?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  coverages?: MaintenanceCoverage[];
};
export type MaintenanceCoverage = {
  id: string;
  contractId: string | null;
  contractName?: string | null;
  periodValue: number | null;
  periodUnit: PeriodUnit;
  anchorDate: string | null;
  anchorType: string;
  firstDueDate: string | null;
  validFrom: string | null;
  validUntil: string | null;
  reviewed: boolean;
  createdAt: string;
};
export type MaintenanceEvent = {
  id: string;
  assetId: string;
  name: string;
  patrimony: string;
  sector: string;
  date: string;
  simulated: boolean;
  contractId?: string | null;
  contractName?: string | null;
};
export type AppConfig = {
  aiReady: boolean;
  authenticated: boolean;
  passwordRequired: boolean;
  mode: "local-demo" | "local-protected";
};

export type ContractSummary = Omit<Contract, "extraction">;
