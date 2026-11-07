export const maintenanceStatusLabels = {
    unassigned: "Responsável não definido",
    uncovered: "Sem contrato ativo",
    expired: "Contrato vencido",
    review: "Dados do contrato a conferir",
    dates: "Prazo do contrato a confirmar",
    covered: "Manutenção por contrato",
    internal: "Manutenção interna",
};
const pretty = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
export function maintenanceProviderFor(asset) {
    return (asset.maintenanceProvider ||
        (asset.contractId ||
            asset.coverages?.some((plan) => plan.contractId) ||
            asset.maintenanceDocuments?.some((record) => record.kind !== "complement")
            ? "contract"
            : "unassigned"));
}
/** Cobertura documental na data consultada; não indica execução ou liberação técnica. */
export function maintenanceStatus(asset, today) {
    const provider = maintenanceProviderFor(asset);
    if (provider === "internal")
        return {
            kind: "internal",
            group: "internal",
            label: maintenanceStatusLabels.internal,
            detail: "Oficina de Manutenção",
        };
    if (provider === "unassigned")
        return {
            kind: "unassigned",
            group: "attention",
            label: maintenanceStatusLabels.unassigned,
            detail: "Escolha contrato ou aditivo, equipe do hospital ou responsável ainda não definido",
        };
    const plans = asset.coverages?.length
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
        return (plan.contractId &&
            (!plan.validFrom || plan.validFrom <= today) &&
            (!plan.validUntil || plan.validUntil >= today) &&
            (!nextStart || today < nextStart));
    });
    const confirmed = [...current]
        .reverse()
        .find((plan) => plan.reviewed && plan.validFrom && plan.validUntil);
    if (confirmed)
        return {
            kind: "covered",
            group: "covered",
            label: maintenanceStatusLabels.covered,
            detail: `Contrato válido até ${pretty(confirmed.validUntil)}`,
            contractId: confirmed.contractId,
        };
    const candidate = [...current].reverse().find((plan) => plan.contractId);
    if (candidate?.reviewed)
        return {
            kind: "dates",
            group: "attention",
            label: maintenanceStatusLabels.dates,
            coverageId: candidate.id,
            detail: !candidate.validFrom && !candidate.validUntil
                ? "Sem as datas de início e fim, não sabemos se a manutenção está incluída no contrato hoje."
                : !candidate.validFrom
                    ? "Sem a data de início, não sabemos se a manutenção está incluída no contrato hoje."
                    : "Sem a data de término, não sabemos se a manutenção está incluída no contrato hoje.",
            contractId: candidate.contractId,
        };
    if (candidate)
        return {
            kind: "review",
            group: "attention",
            label: maintenanceStatusLabels.review,
            detail: "Confira os dados do contrato ou aditivo",
            contractId: candidate.contractId,
        };
    const pendingDocument = asset.maintenanceDocuments?.find((record) => record.kind !== "complement");
    if (pendingDocument)
        return {
            kind: "review",
            group: "attention",
            label: maintenanceStatusLabels.review,
            detail: "Arquivo recebido; confira as condições de manutenção",
            contractId: pendingDocument.contractId,
        };
    const future = plans.find((plan) => plan.contractId && plan.validFrom && plan.validFrom > today);
    if (future)
        return {
            kind: "uncovered",
            group: "attention",
            label: maintenanceStatusLabels.uncovered,
            detail: `Contrato começa em ${pretty(future.validFrom)}`,
            contractId: future.contractId,
        };
    const expired = [...plans]
        .reverse()
        .find((plan) => plan.contractId && plan.validUntil && plan.validUntil < today);
    if (expired)
        return {
            kind: "expired",
            group: "attention",
            label: maintenanceStatusLabels.expired,
            detail: `Contrato encerrado em ${pretty(expired.validUntil)}`,
            contractId: expired.contractId,
        };
    return {
        kind: "uncovered",
        group: "attention",
        label: maintenanceStatusLabels.uncovered,
        detail: "Vincule um contrato ou aditivo, ou escolha a equipe do hospital",
    };
}
