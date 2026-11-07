import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Asset } from "../src/types.js";
import { activeBreakdown } from "../src/breakdowns.js";
import { DomainError, validDate } from "./domain.js";

const scheduledDate = z
  .string()
  .refine(validDate, "Data de manutenção inválida")
  .nullable();
export const breakdownInput = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("report"),
      scheduledDate: scheduledDate.default(null),
    })
    .strict(),
  z.object({ action: z.literal("schedule"), scheduledDate }).strict(),
  z.object({ action: z.literal("resolve") }).strict(),
]);

export function updateBreakdown(
  asset: Asset,
  input: z.infer<typeof breakdownInput>,
  now = new Date().toISOString(),
): Asset {
  const data = breakdownInput.parse(input);
  const active = activeBreakdown(asset);
  const history = asset.breakdowns || [];
  if (data.action === "report") {
    if (active)
      throw new DomainError("Este equipamento já está marcado como quebrado.");
    return {
      ...asset,
      updatedAt: now,
      breakdowns: [
        {
          id: randomUUID(),
          reportedAt: now,
          scheduledDate: data.scheduledDate,
          resolvedAt: null,
        },
        ...history,
      ],
    };
  }
  if (!active)
    throw new DomainError("Este equipamento não está marcado como quebrado.");
  return {
    ...asset,
    updatedAt: now,
    breakdowns: history.map((item) =>
      item.id !== active.id
        ? item
        : data.action === "resolve"
          ? { ...item, resolvedAt: now }
          : { ...item, scheduledDate: data.scheduledDate },
    ),
  };
}
