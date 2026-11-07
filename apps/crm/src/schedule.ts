import type { PeriodUnit } from "./types";

export function occurrence(anchor: string, value: number, unit: PeriodUnit, cycle: number): string {
  const [year, month, day] = anchor.split("-").map(Number);
  if (unit === "days") return new Date(Date.UTC(year, month - 1, day + value * cycle, 12)).toISOString().slice(0, 10);
  const offset = value * cycle * (unit === "years" ? 12 : 1);
  const target = new Date(Date.UTC(year, month - 1 + offset, 1, 12));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString().slice(0, 10);
}

export function nextOccurrence(anchor: string | null, value: number | null, unit: PeriodUnit, from: string): string {
  if (!anchor || !value || !Number.isFinite(new Date(anchor + "T12:00:00Z").getTime())) return "";
  for (let cycle = 1; cycle < 110000; cycle++) {
    const date = occurrence(anchor, value, unit, cycle);
    if (date >= from) return date;
  }
  return "";
}
