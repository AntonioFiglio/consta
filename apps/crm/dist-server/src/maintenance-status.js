export const maintenanceStatusLabels = {
    unassigned: "Responsável não definido",
    uncovered: "Sem cobertura de manutenção",
    expired: "Cobertura de manutenção encerrada",
    review: "Conferir cobertura de manutenção",
    dates: "Vigência da manutenção a confirmar",
    covered: "Manutenção com cobertura contratual",
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
            detail: "Defina a empresa responsável pela manutenção ou a Oficina do hospital",
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
            detail: `Cobertura de manutenção válida até ${pretty(confirmed.validUntil)}`,
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
                ? "Sem as datas de início e fim, não sabemos se a cobertura de manutenção está vigente hoje."
                : !candidate.validFrom
                    ? "Sem a data de início, não sabemos se a cobertura de manutenção está vigente hoje."
                    : "Sem a data de término, não sabemos se a cobertura de manutenção está vigente hoje.",
            contractId: candidate.contractId,
        };
    if (candidate)
        return {
            kind: "review",
            group: "attention",
            label: maintenanceStatusLabels.review,
            detail: "Confira a cobertura no TC, no contrato de manutenção ou no termo aditivo",
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
            detail: `Cobertura de manutenção começa em ${pretty(future.validFrom)}`,
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
            detail: `Cobertura de manutenção encerrada em ${pretty(expired.validUntil)}`,
            contractId: expired.contractId,
        };
    return {
        kind: "uncovered",
        group: "attention",
        label: maintenanceStatusLabels.uncovered,
        detail: "Vincule o documento de manutenção ou defina a Oficina do hospital",
    };
}
