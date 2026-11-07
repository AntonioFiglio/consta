import type {
  Asset,
  MaintenanceCoverage,
  MaintenanceProvider,
} from "./types.js";

export type MaintenanceStatus = {
  group: "covered" | "internal" | "attention";
  label: string;
  detail: string;
  contractId?: string;
};
const pretty = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
export function maintenanceProviderFor(asset: Asset): MaintenanceProvider {
  return (
    asset.maintenanceProvider ||
    (asset.contractId || asset.coverages?.some((plan) => plan.contractId)
      ? "contract"
      : "unassigned")
  );
}

/** Cobertura documental na data consultada; não indica execução ou liberação técnica. */
export function maintenanceStatus(
  asset: Asset,
  today: string,
): MaintenanceStatus {
  const provider = maintenanceProviderFor(asset);
  if (provider === "internal")
    return {
      group: "internal",
      label: "Manutenção interna",
      detail: "Oficina de Manutenção",
    };
  if (provider === "unassigned")
    return {
      group: "attention",
      label: "Manutenção a definir",
      detail: "Defina contrato ou Oficina de Manutenção",
    };
  const plans: MaintenanceCoverage[] = asset.coverages?.length
    ? asset.coverages
    : [
        {
          ...asset,
          id: `legacy:${asset.id}`,
          firstDueDate: asset.firstDueDate || null,
          validFrom: asset.validFrom || null,
          validUntil: asset.validUntil || null,
          createdAt: asset.updatedAt,
        },
      ];
  const current = plans.filter((plan, index) => {
    const nextStart = plans
      .slice(index + 1)
      .find((next) => next.reviewed)?.validFrom;
    return (
      plan.contractId &&
      (!plan.validFrom || plan.validFrom <= today) &&
      (!plan.validUntil || plan.validUntil >= today) &&
      (!nextStart || today < nextStart)
    );
  });
  const confirmed = [...current]
    .reverse()
    .find((plan) => plan.reviewed && plan.validFrom && plan.validUntil);
  if (confirmed)
    return {
      group: "covered",
      label: "Contrato vigente",
      detail: `Cobertura até ${pretty(confirmed.validUntil!)}`,
      contractId: confirmed.contractId!,
    };
  const candidate = [...current].reverse().find((plan) => plan.contractId);
  if (candidate)
    return {
      group: "attention",
      label: "Conferir cobertura",
      detail:
        !candidate.validFrom || !candidate.validUntil
          ? "Complete as datas do contrato"
          : "Confira os dados do contrato",
      contractId: candidate.contractId!,
    };
  const future = plans.find(
    (plan) => plan.contractId && plan.validFrom && plan.validFrom > today,
  );
  if (future)
    return {
      group: "attention",
      label: "Sem cobertura vigente",
      detail: `Contrato começa em ${pretty(future.validFrom!)}`,
      contractId: future.contractId!,
    };
  const expired = [...plans]
    .reverse()
    .find(
      (plan) => plan.contractId && plan.validUntil && plan.validUntil < today,
    );
  if (expired)
    return {
      group: "attention",
      label: "Contrato vencido",
      detail: `Cobertura encerrada em ${pretty(expired.validUntil!)}`,
      contractId: expired.contractId!,
    };
  return {
    group: "attention",
    label: "Sem contrato de manutenção",
    detail: "Vincule um contrato ou defina manutenção interna",
  };
}
