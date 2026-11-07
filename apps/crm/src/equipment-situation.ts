import type { Asset } from "./types.js";
import { repairStatus } from "./breakdowns.js";
import {
  maintenanceStatus,
  type MaintenanceStatusKind,
} from "./maintenance-status.js";
export type EquipmentFilter = "all" | "broken" | MaintenanceStatusKind;
export function equipmentSituation(asset: Asset, today: string) {
  const repair = repairStatus(asset, today);
  const coverage = maintenanceStatus(asset, today);
  return {
    asset,
    repair,
    coverage,
    kind: repair ? ("broken" as const) : coverage.kind,
    label: repair?.label || coverage.label,
    attention: Boolean(repair) || coverage.group === "attention",
  };
}
export function matchesEquipmentFilter(
  asset: Asset,
  filter: EquipmentFilter,
  today: string,
) {
  return filter === "all" || equipmentSituation(asset, today).kind === filter;
}
