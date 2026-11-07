import type { Asset, PeriodUnit } from "./types.js";

export function occurrence(
  anchor: string,
  value: number,
  unit: PeriodUnit,
  cycle: number,
): string {
  const [year, month, day] = anchor.split("-").map(Number);
  if (unit === "days")
    return new Date(Date.UTC(year, month - 1, day + value * cycle, 12))
      .toISOString()
      .slice(0, 10);
  const offset = value * cycle * (unit === "years" ? 12 : 1);
  const target = new Date(Date.UTC(year, month - 1 + offset, 1, 12));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString().slice(0, 10);
}

export function nextOccurrence(
  anchor: string | null,
  value: number | null,
  unit: PeriodUnit,
  from: string,
): string {
  if (
    !anchor ||
    !value ||
    !Number.isFinite(new Date(anchor + "T12:00:00Z").getTime())
  )
    return "";
  for (let cycle = 1; cycle < 110000; cycle++) {
    const date = occurrence(anchor, value, unit, cycle);
    if (date >= from) return date;
  }
  return "";
}

/** Próxima previsão efetiva, incluindo renovação futura, vencimento e lacunas. */
export function nextMaintenanceDate(asset: Asset, from: string): string | null {
  const plans = asset.coverages?.length
    ? asset.coverages
    : [
        {
          ...asset,
          firstDueDate: asset.firstDueDate || null,
          validFrom: asset.validFrom || null,
          validUntil: asset.validUntil || null,
        },
      ];
  const dates: string[] = [];
  for (let index = 0; index < plans.length; index++) {
    const plan = plans[index];
    if (
      !plan.reviewed ||
      !plan.periodValue ||
      (!plan.anchorDate && !plan.firstDueDate)
    )
      continue;
    const lower = [from, plan.validFrom, plan.firstDueDate]
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1)!;
    const date = plan.anchorDate
      ? nextOccurrence(
          plan.anchorDate,
          plan.periodValue,
          plan.periodUnit,
          lower,
        )
      : plan.firstDueDate! >= lower
        ? plan.firstDueDate!
        : nextOccurrence(
            plan.firstDueDate!,
            plan.periodValue,
            plan.periodUnit,
            lower,
          );
    const nextStart = plans
      .slice(index + 1)
      .find((next) => next.reviewed)?.validFrom;
    if (
      date &&
      (!plan.validUntil || date <= plan.validUntil) &&
      (!nextStart || date < nextStart)
    )
      dates.push(date);
  }
  return dates.sort()[0] || null;
}
