import { FileText, Search, ChevronRight } from "lucide-react";
import type { Asset, ContractSummary } from "./types";
import { belongsToContract } from "./ContractViewer";

export function ContractsPage({
  contracts,
  assets,
  query,
  onQuery,
  onOpen,
}: {
  contracts: ContractSummary[];
  assets: Asset[];
  query: string;
  onQuery: (query: string) => void;
  onOpen: (id: string) => void;
}) {
  const filtered = contracts.filter((contract) =>
    `${contract.name} ${assets
      .filter((asset) => belongsToContract(asset, contract.id))
      .map((asset) => `${asset.name} ${asset.patrimony} ${asset.serial}`)
      .join(" ")}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <section className="inventory-section">
      <div className="section-toolbar">
        <div className="section-title">
          <h2>Contratos</h2>
          <span className="badge neutral">{filtered.length} documentos</span>
        </div>
        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar contrato ou equipamento"
            aria-label="Buscar contrato"
          />
        </label>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Adicionado em</th>
              <th>Equipamentos vinculados</th>
              <th>
                <span className="visually-hidden">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((contract) => {
              const units = assets.filter((asset) =>
                belongsToContract(asset, contract.id),
              );
              return (
                <tr key={contract.id}>
                  <td>
                    <div className="asset-name">
                      <span className="equipment-icon">
                        <FileText size={18} />
                      </span>
                      <div>
                        <button onClick={() => onOpen(contract.id)}>
                          {contract.name}
                        </button>
                        <small>
                          {contract.mime === "application/pdf"
                            ? "PDF"
                            : "Texto"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="mono">
                    {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <span>
                      {units.length}{" "}
                      {units.length === 1 ? "equipamento" : "equipamentos"}
                    </span>
                    <small className="inventory-serial">
                      {units
                        .slice(0, 3)
                        .map((asset) => asset.name)
                        .join(" · ") || "Aguardando vínculo"}
                      {units.length > 3 ? "…" : ""}
                    </small>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => onOpen(contract.id)}
                    >
                      Ver contrato <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="document-empty">
            <FileText size={30} />
            <h3>
              {query
                ? "Nenhum contrato encontrado"
                : "Seus contratos, em um só lugar."}
            </h3>
            <p>
              {query
                ? "Tente outro nome ou número de tombamento."
                : "Os documentos enviados no cadastro ficam disponíveis aqui."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
