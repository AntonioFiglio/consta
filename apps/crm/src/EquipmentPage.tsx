import { SearchField } from "./SearchField";
import { useState } from "react";
import {
  ArrowRight,
  Plus,
  Flag,
  SlidersHorizontal,
} from "lucide-react";
import { brandAndModel } from "./equipment-identity";
import type { OnBreakdown } from "./breakdowns";
import {
  equipmentSituation,
  matchesEquipmentFilter,
  type EquipmentFilter,
} from "./equipment-situation";
import { StatusHelp } from "./StatusHelp";
import type { Asset } from "./types";
import {
  maintenanceStatusLabels,
  type MaintenanceStatusKind,
} from "./maintenance-status";

const AttentionFlag = () => (
  <Flag size={14} fill="currentColor" aria-hidden="true" />
);

const statusFilters: {
  value: EquipmentFilter;
  label: string;
}[] = [
  { value: "all", label: "Todas as situações" },
  { value: "broken", label: "Equipamento quebrado" },
  { value: "unassigned", label: maintenanceStatusLabels.unassigned },
  { value: "uncovered", label: maintenanceStatusLabels.uncovered },
  { value: "expired", label: maintenanceStatusLabels.expired },
  { value: "review", label: maintenanceStatusLabels.review },
  { value: "dates", label: maintenanceStatusLabels.dates },
  { value: "covered", label: maintenanceStatusLabels.covered },
  { value: "internal", label: maintenanceStatusLabels.internal },
];
const repairPriority = { overdue: 0, unscheduled: 1, scheduled: 2 };
const priority: Record<MaintenanceStatusKind, number> = {
  unassigned: 0,
  expired: 1,
  uncovered: 2,
  review: 3,
  dates: 4,
  internal: 5,
  covered: 6,
};

export function EquipmentPage({
  assets,
  query,
  onQuery,
  today,
  onView,
  onAssign,
  onBreakdown,
  onCreate,
  initialFilter = "all",
}: {
  assets: Asset[];
  query: string;
  onQuery: (query: string) => void;
  today: string;
  onView: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onBreakdown: OnBreakdown;
  onCreate: () => void;
  initialFilter?: EquipmentFilter;
}) {
  const [filter, setFilter] = useState<EquipmentFilter>(initialFilter);
  const rows = assets
    .filter((asset) => matchesEquipmentFilter(asset, filter, today))
    .map((asset) => equipmentSituation(asset, today))
    .sort(
      (a, b) =>
        (a.repair ? repairPriority[a.repair.stage] : 3) -
          (b.repair ? repairPriority[b.repair.stage] : 3) ||
        priority[a.coverage.kind] - priority[b.coverage.kind] ||
        a.asset.name.localeCompare(b.asset.name, "pt-BR"),
    );
  return (
    <section
      className="inventory-section equipment-status-page"
      aria-label="Situação da manutenção dos equipamentos"
    >
      <div className="equipment-status-toolbar">
        <SearchField value={query} onChange={onQuery} placeholder="Buscar nome, marca, modelo ou tombamento" label="Buscar equipamento" />
        <span className="equipment-attention-legend">
          <AttentionFlag /> Pendências aparecem primeiro
        </span>
      </div>
      <div
        className="equipment-status-filters"
        role="group"
        aria-label="Filtrar por situação da manutenção"
      >
        {statusFilters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`equipment-status-filter ${option.value}`}
          >
            {option.value !== "all" && (
              <span aria-hidden="true" className="filter-status-dot" />
            )}
            {option.label}
          </button>
        ))}
      </div>
      <div className="table-container">
        <table className="equipment-status-table">
          <caption className="visually-hidden">
            Equipamentos com pendências são marcados com bandeira vermelha e
            aparecem primeiro.
          </caption>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Situação do equipamento</th>
              <th>
                <span className="visually-hidden">Ação</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ({ asset, coverage: status, repair: broken, attention }) => {
                const action = broken?.action || "Registrar quebra";
                return (
                  <tr
                    key={asset.id}
                    className={attention ? "equipment-needs-attention" : ""}
                  >
                    <td>
                      <div className="equipment-status-identity">
                        <div>
                          <div className="equipment-name-row">
                            <button
                              className="equipment-name-link"
                              onClick={() => onView(asset)}
                            >
                              {asset.name}
                            </button>
                            {attention && (
                              <span
                                className="equipment-attention-flag"
                                role="img"
                                aria-label={`Precisa de atenção: ${broken ? "Equipamento quebrado" : status.label}`}
                                title={
                                  broken ? "Equipamento quebrado" : status.label
                                }
                              >
                                <AttentionFlag />
                              </span>
                            )}
                          </div>
                          <small className="equipment-brand-model">
                            {brandAndModel(asset) ||
                              "Marca e modelo não informados"}
                          </small>
                          <small className="equipment-secondary">
                            <span className="mono">
                              Tombamento {asset.patrimony}
                            </span>
                            <span aria-hidden="true"> · </span>
                            {asset.sector || "Setor não informado"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="equipment-status-with-help">
                        <span
                          className={`equipment-status-text ${broken ? "broken" : status.kind}`}
                        >
                          {broken ? "Equipamento quebrado" : status.label}
                        </span>
                        {!broken && <StatusHelp status={status} />}
                      </div>
                      {broken && (
                        <small
                          className={`equipment-repair-detail ${broken.stage}`}
                        >
                          {broken.detail}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="equipment-row-actions">
                        <button
                          className={`equipment-status-action ${broken ? "requires-action" : ""}`}
                          onClick={() =>
                            onBreakdown(asset, broken ? "schedule" : "report")
                          }
                          aria-label={`${action}: ${asset.name}`}
                        >
                          {broken ? (
                            <ArrowRight size={14} />
                          ) : (
                            <Flag size={14} />
                          )}
                          {action}
                        </button>
                        <button
                          type="button"
                          className="icon-button equipment-assignment-action"
                          aria-label={`Configurar atendimento: ${asset.name}`}
                          title="Configurar atendimento"
                          onClick={() => onAssign(asset)}
                        >
                          <SlidersHorizontal size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
        {!rows.length && (
          <div className="document-empty">
            <h3>
              {query || filter !== "all"
                ? "Nenhum equipamento nesta situação"
                : "Cadastre o primeiro equipamento"}
            </h3>
            <p>
              {query || filter !== "all"
                ? "Escolha outra situação ou ajuste a busca."
                : "Defina quem cuida da manutenção de cada equipamento."}
            </p>
            {!assets.length && !query && filter === "all" && (
              <button className="button primary" onClick={onCreate}>
                <Plus size={15} /> Cadastrar equipamento
              </button>
            )}
            {filter !== "all" && (
              <button
                type="button"
                className="text-button"
                onClick={() => setFilter("all")}
              >
                Ver todas as situações
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
