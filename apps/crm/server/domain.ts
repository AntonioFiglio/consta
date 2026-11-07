import { z } from "zod";
import { randomUUID } from "node:crypto";
import { occurrence } from "../src/schedule.js";
export { occurrence } from "../src/schedule.js";
import type {
  Asset,
  MaintenanceCoverage,
  MaintenanceEvent,
} from "../src/types.js";

export function validDate(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number(value.slice(0, 4)) < 1900 ||
    Number(value.slice(0, 4)) > 2200
  )
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export const assetInput = z
  .object({
    name: z.string().trim().min(1).max(160),
    model: z.string().trim().max(160).default(""),
    patrimony: z.string().trim().min(1).max(80),
    serial: z.string().trim().max(100).default(""),
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
      .refine(validDate, "Início de vigência inválido")
      .nullable()
      .optional()
      .default(null),
    validUntil: z
      .string()
      .refine(validDate, "Fim de vigência inválido")
      .nullable()
      .optional()
      .default(null),
    notes: z.string().max(4000).default(""),
  })
  .superRefine((data, ctx) => {
    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil)
      ctx.addIssue({
        code: "custom",
        message: "O fim da cobertura deve ser igual ou posterior ao início.",
      });
    if (
      data.firstDueDate &&
      data.validFrom &&
      data.firstDueDate < data.validFrom
    )
      ctx.addIssue({
        code: "custom",
        message:
          "A primeira manutenção deve estar dentro da vigência do contrato.",
      });
    if (
      data.firstDueDate &&
      data.validUntil &&
      data.firstDueDate > data.validUntil
    )
      ctx.addIssue({
        code: "custom",
        message: "A primeira manutenção é posterior ao fim da cobertura.",
      });
    if (
      data.reviewed &&
      (!data.periodValue ||
        (!data.anchorDate && !data.firstDueDate) ||
        !data.anchorType)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Informe periodicidade, data e tipo de marco antes de confirmar a revisão.",
      });
    }
  });

export class DomainError extends Error {}

export function coverageFromAsset(asset: Asset): MaintenanceCoverage {
  return {
    id: `legacy:${asset.id}`,
    contractId: asset.contractId,
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

export function prepareAsset(
  existing: Asset | undefined,
  input: z.infer<typeof assetInput>,
  renewal = false,
): Asset {
  const now = new Date().toISOString();
  const plans = existing
    ? [
        ...(existing.coverages?.length
          ? existing.coverages
          : [coverageFromAsset(existing)]),
      ]
    : [];
  if (renewal) {
    if (
      !existing ||
      !input.contractId ||
      input.contractId === existing.contractId
    )
      throw new DomainError(
        "Selecione um contrato diferente para renovar a cobertura.",
      );
    if (!input.validFrom)
      throw new DomainError(
        "Informe quando começa a cobertura do novo contrato.",
      );
    if (plans.some((plan) => plan.contractId === input.contractId))
      throw new DomainError(
        "Este contrato já faz parte do histórico do equipamento.",
      );
  } else if (existing && input.contractId !== existing.contractId) {
    throw new DomainError(
      "Adicione o novo contrato nas configurações avançadas para preservar o anterior.",
    );
  }
  const previous = plans[renewal ? plans.length - 1 : plans.length - 2];
  if (
    previous?.validFrom &&
    (!input.validFrom || input.validFrom <= previous.validFrom)
  )
    throw new DomainError(
      "O novo período deve começar depois do início do contrato anterior.",
    );
  const coverage: MaintenanceCoverage = {
    id: renewal || !plans.length ? randomUUID() : plans[plans.length - 1].id,
    contractId: input.contractId,
    periodValue: input.periodValue,
    periodUnit: input.periodUnit,
    anchorDate: input.anchorDate,
    anchorType: input.anchorType,
    firstDueDate: input.firstDueDate,
    validFrom: input.validFrom,
    validUntil: input.validUntil,
    reviewed: input.reviewed,
    createdAt:
      renewal || !plans.length ? now : plans[plans.length - 1].createdAt,
  };
  if (renewal || !plans.length) plans.push(coverage);
  else plans[plans.length - 1] = coverage;
  return {
    ...input,
    id: existing?.id || randomUUID(),
    simulated: existing?.simulated || false,
    updatedAt: now,
    coverages: plans,
  };
}

/** Projeção por intervalo consultado; nenhuma tabela de eventos duplicáveis. */
export function eventsFor(
  assets: Asset[],
  from: string,
  to: string,
): MaintenanceEvent[] {
  const events: MaintenanceEvent[] = [];
  for (const asset of assets) {
    const plans = asset.coverages?.length
      ? asset.coverages
      : [coverageFromAsset(asset)];
    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index];
      const anchor = plan.anchorDate || plan.firstDueDate;
      if (!plan.reviewed || !anchor || !plan.periodValue) continue;
      const nextStart = plans
        .slice(index + 1)
        .find((next) => next.reviewed)?.validFrom;
      const max = Math.max(
        0,
        Math.min(
          110000,
          (Number(to.slice(0, 4)) - Number(anchor.slice(0, 4)) + 2) * 366,
        ),
      );
      for (let cycle = plan.anchorDate ? 1 : 0; cycle <= max; cycle++) {
        const date = occurrence(
          anchor,
          plan.periodValue,
          plan.periodUnit,
          cycle,
        );
        if (
          date > to ||
          (plan.validUntil && date > plan.validUntil) ||
          (nextStart && date >= nextStart)
        )
          break;
        if (
          date < from ||
          (plan.validFrom && date < plan.validFrom) ||
          (plan.firstDueDate && date < plan.firstDueDate)
        )
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
  return events.sort(
    (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
  );
}
