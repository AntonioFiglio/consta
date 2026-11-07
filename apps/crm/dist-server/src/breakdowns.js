export function activeBreakdown(asset) {
    return asset.breakdowns?.find((item) => !item.resolvedAt);
}
export function repairStatus(asset, today) {
    const active = activeBreakdown(asset);
    if (!active)
        return null;
    const stage = !active.scheduledDate
        ? "unscheduled"
        : active.scheduledDate < today
            ? "overdue"
            : "scheduled";
    const date = active.scheduledDate;
    const pretty = date
        ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
        : "";
    return {
        active,
        stage,
        date,
        label: "Equipamento quebrado",
        detail: stage === "unscheduled"
            ? "Aguardando agendamento"
            : stage === "overdue"
                ? `Reparo em atraso · ${pretty}`
                : `Reparo agendado · ${pretty}`,
        action: stage === "unscheduled" ? "Agendar reparo" : "Atualizar reparo",
    };
}
export function repairEventFor(asset, from, to) {
    const active = activeBreakdown(asset);
    if (!active?.scheduledDate ||
        active.scheduledDate < from ||
        active.scheduledDate > to)
        return null;
    return {
        id: `${asset.id}:breakdown:${active.id}`,
        kind: "corrective",
        assetId: asset.id,
        name: asset.name,
        patrimony: asset.patrimony,
        sector: asset.sector,
        date: active.scheduledDate,
        simulated: asset.simulated,
    };
}
export function sortMaintenanceEvents(events) {
    return events.sort((a, b) => a.date.localeCompare(b.date) ||
        Number(b.kind === "corrective") - Number(a.kind === "corrective") ||
        a.name.localeCompare(b.name));
}
export function syncRepairEvent(events, asset, from, to) {
    const next = events.filter((event) => !(event.assetId === asset.id && event.kind === "corrective"));
    const repair = repairEventFor(asset, from, to);
    if (repair)
        next.push(repair);
    return sortMaintenanceEvents(next);
}
