/** Identificação complementar, sem inferir marca a partir do modelo. */
export function brandAndModel(equipment: {
  brand?: string;
  model?: string;
}): string {
  return [equipment.brand?.trim(), equipment.model?.trim()]
    .filter(Boolean)
    .join(" · ");
}
