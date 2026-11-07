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
  maintenanceCompany?: Evidence;
  maintenancePhone?: Evidence;
  maintenanceEmail?: Evidence;
  brand?: Evidence;
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
export type MaintenanceDocumentKind =
  "contract" | "amendment" | "outsourced" | "complement";
export type Contract = {
  documentKind?: MaintenanceDocumentKind;
  parentContractId?: string | null;
  id: string;
  name: string;
  mime: string;
  createdAt: string;
  extraction: Extraction | null;
};
export type MaintenanceProvider = "contract" | "internal" | "unassigned";
export type EquipmentBreakdown = {
  id: string;
  reportedAt: string;
  scheduledDate: string | null;
  resolvedAt: string | null;
};
export type MaintenanceContact = {
  maintenanceCompany?: string;
  maintenancePhone?: string;
  maintenanceEmail?: string;
};
export type Asset = MaintenanceContact & {
  breakdowns?: EquipmentBreakdown[];
  maintenanceProvider?: MaintenanceProvider;
  id: string;
  name: string;
  brand: string;
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
  maintenanceDocuments?: MaintenanceDocument[];
};
export type MaintenanceCoverage = MaintenanceContact & {
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
  kind?: "preventive" | "corrective";
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

export type ContractBriefTopic = "responsible" | "equipment" | "services" | "dates" | "response" | "obligations" | "costs" | "limits";
export type ContractBrief = {
  version: 1;
  source: "simulated" | "ai";
  generatedAt: string;
  sourceHash: string;
  model: string | null;
  overview: string;
  points: { topic: ContractBriefTopic; text: string; page: number | null; quote: string }[];
  warnings: string[];
};

export type ContractBriefRecord = {
  state: "pending" | "ready" | "failed";
  mode: "ai" | "simulated";
  startedAt: string;
  token: string | null;
  brief: ContractBrief | null;
};

export type MaintenanceDocument = MaintenanceContact & {
  id: string;
  contractId: string;
  name: string;
  kind: MaintenanceDocumentKind;
  notes: string;
  createdAt: string;
};
