import { useState } from "react";
import { Search, ChevronRight, Plus } from "lucide-react";
import type { Asset } from "./types";
import { maintenanceStatus } from "./maintenance-status";
import { nextMaintenanceDate } from "./schedule";

export function EquipmentPage({
  assets,
  query,
  onQuery,
  today,
  onView,
  onContract,
  onAssign,
  onCreate,
}: {
  assets: Asset[];
  query: string;
  onQuery: (query: string) => void;
  today: string;
  onView: (asset: Asset) => void;
  onContract: (id: string) => void;
  onAssign: (asset: Asset) => void;
  onCreate: () => void;
}) {
  const [filter, setFilter] = useState("all");
  const rows = assets
    .map((asset) => ({ asset, status: maintenanceStatus(asset, today) }))
    .filter(({ status }) => filter === "all" || status.group === filter)
    .sort(
      (a, b) =>
        Number(b.status.group === "attention") -
          Number(a.status.group === "attention") ||
        a.asset.name.localeCompare(b.asset.name, "pt-BR"),
    );
  return (
    <section
      className="inventory-section clinical-equipment-section"
      aria-label="Gestão de equipamentos"
    >
      <div className="equipment-list-toolbar">
        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar nome, tombamento ou setor"
            aria-label="Buscar equipamento"
          />
        </label>
        <label className="equipment-filter">
          Manutenção
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Todos os equipamentos</option>
            <option value="attention">Precisam de atenção</option>
            <option value="covered">Com contrato vigente</option>
            <option value="internal">Oficina de Manutenção</option>
          </select>
        </label>
      </div>
      <div className="table-container">
        <table className="clinical-equipment-table">
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Número de tombamento</th>
              <th>Setor</th>
              <th>Manutenção</th>
              <th>Próxima manutenção</th>
              <th>
                <span className="visually-hidden">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ asset, status }) => {
              const next = nextMaintenanceDate(asset, today);
              return (
                <tr key={asset.id}>
                  <td>
                    <button
                      className="equipment-name-link"
                      onClick={() => onView(asset)}
                    >
                      {asset.name}
                    </button>
                    <small className="equipment-secondary">
                      {asset.model || "Modelo não informado"}
                      {asset.simulated ? " · Simulado" : ""}
                    </small>
                  </td>
                  <td className="mono">{asset.patrimony}</td>
                  <td>{asset.sector || "Setor não informado"}</td>
                  <td>
                    <span className={`maintenance-status ${status.group}`}>
                      <i />
                      {status.label}
                    </span>
                    <small className="equipment-secondary">
                      {status.detail}
                    </small>
                    {status.contractId && (
                      <button
                        className="text-button maintenance-contract-link"
                        onClick={() => onContract(status.contractId!)}
                      >
                        Ver contrato
                      </button>
                    )}
                  </td>
                  <td>
                    {next
                      ? new Date(next + "T12:00:00").toLocaleDateString("pt-BR")
                      : "Sem data prevista"}
                    {!asset.reviewed && (
                      <small className="equipment-secondary">
                        Planejamento pendente
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="equipment-row-actions">
                      <button
                        className="text-button"
                        onClick={() => onAssign(asset)}
                      >
                        Definir manutenção
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Ver ficha de ${asset.name}`}
                        onClick={() => onView(asset)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <div className="document-empty">
            <h3>
              {query || filter !== "all"
                ? "Nenhum equipamento nesta busca"
                : "Cadastre o primeiro equipamento"}
            </h3>
            <p>
              {query || filter !== "all"
                ? "Tente outro nome ou escolha outro filtro de manutenção."
                : "Informe os dados do equipamento para organizar a manutenção."}
            </p>
            {!assets.length && !query && filter === "all" && (
              <button className="button primary" onClick={onCreate}>
                <Plus size={15} /> Cadastrar equipamento
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
