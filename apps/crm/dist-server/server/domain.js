import { z } from "zod";
import { randomUUID } from "node:crypto";
import { repairEventFor, sortMaintenanceEvents } from "../src/breakdowns.js";
import { occurrence } from "../src/schedule.js";
export { occurrence } from "../src/schedule.js";
export function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number(value.slice(0, 4)) < 1900 ||
        Number(value.slice(0, 4)) > 2200)
        return false;
    const date = new Date(`${value}T12:00:00Z`);
    return (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value);
}
export const assetInput = z
    .object({
    name: z.string().trim().min(1).max(160),
    brand: z.string().trim().max(160).optional(),
    maintenanceCompany: z.string().trim().max(200).optional(),
    maintenancePhone: z.string().trim().max(100).optional(),
    maintenanceEmail: z
        .string()
        .trim()
        .max(254)
        .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "E-mail da manutenção inválido")
        .optional(),
    model: z.string().trim().max(160).default(""),
    patrimony: z.string().trim().max(80).default(""),
    importSource: z.object({
        contractId: z.string().uuid(),
        unitKey: z.string().min(1).max(4000),
        position: z.number().int().min(1).max(50).optional(),
        total: z.number().int().min(1).max(50).optional(),
    }).optional(),
    serial: z.string().trim().max(100).default(""),
    maintenanceProvider: z
        .enum(["contract", "internal", "unassigned"])
        .optional(),
    sector: z.string().trim().max(100).default(""),
    contractId: z.string().uuid().nullable(),
    periodValue: z.number().int().min(1).max(366).nullable(),
    periodUnit: z.enum(["days", "months", "years"]),
    anchorDate: z.string().refine(validDate, "Data inválida").nullable(),
    anchorType: z.string().trim().max(160).default(""),
    reviewed: z.boolean(),
    firstDueDate: z
        .string()
        .refine(validDate, "Primeira data inválida")
        .nullable()
        .optional()
        .default(null),
    validFrom: z
        .string()
        .refine(validDate, "Data de início da cobertura de manutenção inválida")
        .nullable()
        .optional()
        .default(null),
    validUntil: z
        .string()
        .refine(validDate, "Data de fim da cobertura de manutenção inválida")
        .nullable()
        .optional()
        .default(null),
    notes: z.string().max(4000).default(""),
})
    .superRefine((data, ctx) => {
    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil)
        ctx.addIssue({
            code: "custom",
            message: "O fim da cobertura de manutenção deve ser igual ou posterior ao início.",
        });
    if (data.firstDueDate &&
        data.validFrom &&
        data.firstDueDate < data.validFrom)
        ctx.addIssue({
            code: "custom",
            message: "A primeira manutenção deve estar dentro do período de cobertura.",
        });
    if (data.firstDueDate &&
        data.validUntil &&
        data.firstDueDate > data.validUntil)
        ctx.addIssue({
            code: "custom",
            message: "A primeira manutenção é posterior ao fim da cobertura.",
        });
    if (data.reviewed &&
        (!data.periodValue ||
            (!data.anchorDate && !data.firstDueDate) ||
            !data.anchorType)) {
        ctx.addIssue({
            code: "custom",
            message: "Informe periodicidade, data e tipo de marco antes de confirmar a revisão.",
        });
    }
});
export class DomainError extends Error {
}
export const maintenanceDocumentInput = z
    .object({
    kind: z.enum(["amendment", "outsourced"]),
    notes: z.string().trim().max(4000).default(""),
})
    .strict();
export function coverageFromAsset(asset) {
    return {
        id: `legacy:${asset.id}`,
        contractId: asset.contractId,
        maintenanceCompany: asset.maintenanceCompany,
        maintenancePhone: asset.maintenancePhone,
        maintenanceEmail: asset.maintenanceEmail,
        periodValue: asset.periodValue,
        periodUnit: asset.periodUnit,
        anchorDate: asset.anchorDate,
        anchorType: asset.anchorType,
        firstDueDate: asset.firstDueDate || null,
        validFrom: asset.validFrom || null,
        validUntil: asset.validUntil || null,
        reviewed: asset.reviewed,
        createdAt: asset.updatedAt,
    };
}
export const coverageDatesInput = z
    .object({
    validFrom: z
        .string()
        .refine(validDate, "Data de início da cobertura de manutenção inválida"),
    validUntil: z
        .string()
        .refine(validDate, "Data de fim da cobertura de manutenção inválida"),
})
    .strict();
export function updateCoverageDates(asset, coverageId, input) {
    const dates = coverageDatesInput.parse(input);
    const plans = asset.coverages?.length
        ? asset.coverages
        : [coverageFromAsset(asset)];
    const index = plans.findIndex((plan) => plan.id === coverageId);
    if (index < 0)
        throw new DomainError("Cobertura não encontrada neste equipamento.");
    const plan = plans[index];
    assetInput.parse({ ...asset, ...plan, ...dates });
    if (plans[index - 1]?.validFrom &&
        dates.validFrom <= plans[index - 1].validFrom)
        throw new DomainError("A cobertura de manutenção deve começar depois do início da cobertura anterior.");
    if (plans[index + 1]?.validFrom &&
        dates.validFrom >= plans[index + 1].validFrom)
        throw new DomainError("A cobertura de manutenção deve começar antes da próxima cobertura.");
    return {
        ...asset,
        ...(index === plans.length - 1 ? dates : {}),
        coverages: plans.map((current, position) => position === index ? { ...current, ...dates } : current),
        updatedAt: new Date().toISOString(),
    };
}
export function prepareAsset(existing, input, renewal = false) {
    const now = new Date().toISOString();
    const plans = existing
        ? [
            ...(existing.coverages?.length
                ? existing.coverages
                : [coverageFromAsset(existing)]),
        ]
        : [];
    if (renewal) {
        if (!existing ||
            !input.contractId ||
            input.contractId === existing.contractId)
            throw new DomainError("Selecione outro contrato de manutenção ou termo aditivo para renovar a cobertura.");
        if (!input.validFrom)
            throw new DomainError("Informe o início da nova cobertura de manutenção.");
        if (plans.some((plan) => plan.contractId === input.contractId))
            throw new DomainError("Este documento contratual já faz parte do histórico do equipamento.");
    }
    else if (existing && input.contractId !== existing.contractId) {
        throw new DomainError("Adicione o novo documento de manutenção nos detalhes para preservar o histórico.");
    }
    const previous = plans[renewal ? plans.length - 1 : plans.length - 2];
    if (previous?.validFrom &&
        (!input.validFrom || input.validFrom <= previous.validFrom))
        throw new DomainError("A nova cobertura de manutenção deve começar depois do início da anterior.");
    const coverage = {
        id: renewal || !plans.length ? randomUUID() : plans[plans.length - 1].id,
        contractId: input.contractId,
        maintenanceCompany: input.maintenanceCompany ??
            (renewal ? "" : existing?.maintenanceCompany) ??
            "",
        maintenancePhone: input.maintenancePhone ??
            (renewal ? "" : existing?.maintenancePhone) ??
            "",
        maintenanceEmail: input.maintenanceEmail ??
            (renewal ? "" : existing?.maintenanceEmail) ??
            "",
        periodValue: input.periodValue,
        periodUnit: input.periodUnit,
        anchorDate: input.anchorDate,
        anchorType: input.anchorType,
        firstDueDate: input.firstDueDate,
        validFrom: input.validFrom,
        validUntil: input.validUntil,
        reviewed: input.reviewed,
        createdAt: renewal || !plans.length ? now : plans[plans.length - 1].createdAt,
    };
    if (renewal || !plans.length)
        plans.push(coverage);
    else
        plans[plans.length - 1] = coverage;
    return {
        ...input,
        importSource: existing?.importSource || input.importSource,
        brand: input.brand ?? existing?.brand ?? "",
        maintenanceCompany: coverage.maintenanceCompany,
        maintenancePhone: coverage.maintenancePhone,
        maintenanceEmail: coverage.maintenanceEmail,
        breakdowns: existing?.breakdowns || [],
        maintenanceProvider: input.maintenanceProvider ??
            existing?.maintenanceProvider ??
            (input.contractId ? "contract" : "unassigned"),
        id: existing?.id || randomUUID(),
        simulated: existing?.simulated || false,
        updatedAt: now,
        coverages: plans,
    };
}
/** Projeção por intervalo consultado; nenhuma tabela de eventos duplicáveis. */
export function eventsFor(assets, from, to) {
    const events = [];
    for (const asset of assets) {
        const repair = repairEventFor(asset, from, to);
        if (repair)
            events.push(repair);
        const plans = asset.coverages?.length
            ? asset.coverages
            : [coverageFromAsset(asset)];
        for (let index = 0; index < plans.length; index++) {
            const plan = plans[index];
            const anchor = plan.anchorDate || plan.firstDueDate;
            if (!plan.reviewed || !anchor || !plan.periodValue)
                continue;
            const nextStart = plans
                .slice(index + 1)
                .find((next) => next.reviewed)?.validFrom;
            const max = Math.max(0, Math.min(110000, (Number(to.slice(0, 4)) - Number(anchor.slice(0, 4)) + 2) * 366));
            for (let cycle = plan.anchorDate ? 1 : 0; cycle <= max; cycle++) {
                const date = occurrence(anchor, plan.periodValue, plan.periodUnit, cycle);
                if (date > to ||
                    (plan.validUntil && date > plan.validUntil) ||
                    (nextStart && date >= nextStart))
                    break;
                if (date < from ||
                    (plan.validFrom && date < plan.validFrom) ||
                    (plan.firstDueDate && date < plan.firstDueDate))
                    continue;
                events.push({
                    id: `${asset.id}:${date}`,
                    assetId: asset.id,
                    name: asset.name,
                    patrimony: asset.patrimony,
                    sector: asset.sector,
                    date,
                    simulated: asset.simulated,
                    contractId: plan.contractId,
                    contractName: plan.contractName || null,
                });
            }
        }
    }
    return sortMaintenanceEvents(events);
}
