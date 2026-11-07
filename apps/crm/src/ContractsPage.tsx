import { SearchField } from "./SearchField";
import { contractCopy } from "./contract-copy";
import { Fragment, useEffect, useState } from "react";
import { FileText, ChevronRight, ChevronDown, Plus } from "lucide-react";
import type { Asset, ContractSummary } from "./types";
import {
  assetHasDocument,
  groupContracts,
  documentKindLabel,
} from "./contract-groups";
import { ContractAttachment } from "./ContractAttachment";

export function ContractsPage({
  contracts,
  assets,
  query,
  onQuery,
  onOpen,
  onChanged,
}: {
  contracts: ContractSummary[];
  assets: Asset[];
  query: string;
  onQuery: (query: string) => void;
  onOpen: (id: string, view?: "summary" | "document" | "assets") => void;
  onChanged: (contract: ContractSummary) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchCollapsed, setSearchCollapsed] = useState<Set<string>>(
    new Set(),
  );
  const [adding, setAdding] = useState<ContractSummary | null>(null);
  useEffect(() => setSearchCollapsed(new Set()), [query]);
  const groups = groupContracts(contracts, assets, query);
  function toggle(id: string) {
    const update = (old: Set<string>) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    };
    if (query.trim()) setSearchCollapsed(update);
    else setExpanded(update);
  }
  function saved(contract: ContractSummary) {
    if (adding) setExpanded((old) => new Set([...old, adding.id]));
    if (contract.parentContractId)
      setExpanded((old) => new Set([...old, contract.parentContractId!]));
    onChanged(contract);
    setAdding(null);
  }
  return (
    <section className="inventory-section contracts-section">
      <div className="contracts-list-toolbar">
        <SearchField
          value={query}
          onChange={onQuery}
          placeholder="Buscar TC, contrato de manutenção, termo aditivo ou equipamento"
          label="Buscar TC, contrato de manutenção ou termo aditivo"
        />
        <span className="field-hint">
          Abra um Termo de Contrato (TC) para consultar os documentos e
          equipamentos vinculados.
        </span>
      </div>
      <div className="table-container">
        <table className="contracts-family-table">
          <thead>
            <tr>
              <th>Documento contratual</th>
              <th>Adicionado em</th>
              <th>Equipamentos</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ principal, amendments, units }) => {
              const open = query.trim()
                ? !searchCollapsed.has(principal.id)
                : expanded.has(principal.id);
              return (
                <Fragment key={principal.id}>
                  <tr className={open ? "contract-family-open" : ""}>
                    <td>
                      <div className="contract-family-name">
                        <button
                          className="icon-button"
                          aria-expanded={open}
                          aria-controls={`amendments-${principal.id}`}
                          aria-label={`${open ? "Recolher" : "Ver"} documentos vinculados a ${principal.name}`}
                          onClick={() => toggle(principal.id)}
                        >
                          {open ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <FileText size={18} />
                        <div>
                          <button
                            className="contract-document-name"
                            onClick={() => onOpen(principal.id)}
                          >
                            {principal.name}
                          </button>
                          <small className="equipment-secondary">
                            {documentKindLabel(principal)} ·{" "}
                            {amendments.length
                              ? `${amendments.length} ${amendments.length === 1 ? "documento vinculado" : "documentos vinculados"}`
                              : "Sem documentos vinculados"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="mono">
                      {new Date(principal.createdAt).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => onOpen(principal.id, "assets")}
                      >
                        Ver equipamentos
                      </button>
                      <small className="equipment-secondary">
                        {units
                          .slice(0, 2)
                          .map((unit) => unit.name)
                          .join(" · ") || "Nenhum equipamento vinculado"}
                        {units.length > 2 ? " · e outros" : ""}
                      </small>
                    </td>
                  </tr>
                  <tr
                    className="contract-amendments-row"
                    hidden={!open}
                    id={`amendments-${principal.id}`}
                  >
                    <td colSpan={3}>
                      <div
                        className="contract-amendments"
                        role="region"
                        aria-label={`Documentos vinculados a ${principal.name}`}
                      >
                        <div className="contract-amendments-toolbar">
                          <div className="contract-amendments-title">
                            <h3>{contractCopy.relatedFiles}</h3>
                            <span className="badge neutral">
                              {amendments.length}
                            </span>
                            <p>
                              Termos aditivos, contratos de manutenção e anexos
                              vinculados.
                            </p>
                          </div>
                          {principal.documentKind !== "complement" &&
                            principal.documentKind !== "outsourced" && (
                              <button
                                className="button secondary"
                                onClick={() => setAdding(principal)}
                              >
                                <Plus size={13} /> {contractCopy.addFile}
                              </button>
                            )}
                        </div>
                        {amendments.length ? (
                          <ul className="amendment-list">
                            {amendments.map((amendment) => {
                              const related = assets.filter((asset) =>
                                assetHasDocument(
                                  asset,
                                  new Set([amendment.id]),
                                ),
                              );
                              return (
                                <li
                                  key={amendment.id}
                                  className="amendment-item"
                                >
                                  <span
                                    className="amendment-document-icon"
                                    aria-hidden="true"
                                  >
                                    <FileText size={19} />
                                  </span>
                                  <div className="amendment-details">
                                    <button
                                      className="contract-document-name"
                                      onClick={() => onOpen(amendment.id)}
                                    >
                                      {amendment.name}
                                    </button>
                                    <div className="amendment-metadata">
                                      <span>
                                        {documentKindLabel(amendment)}
                                      </span>
                                      <span>
                                        Adicionado em{" "}
                                        {new Date(
                                          amendment.createdAt,
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                      <span>
                                        {related.length
                                          ? `${related.length} ${related.length === 1 ? "equipamento vinculado" : "equipamentos vinculados"}`
                                          : "Sem equipamentos vinculados"}
                                      </span>
                                    </div>
                                    {related.length > 0 && (
                                      <p className="amendment-equipment">
                                        {related
                                          .slice(0, 2)
                                          .map((asset) => asset.name)
                                          .join(" · ")}
                                        {related.length > 2
                                          ? " · e outros"
                                          : ""}
                                      </p>
                                    )}
                                  </div>
                                  <div className="amendment-actions">
                                    <button
                                      className="text-button"
                                      onClick={() => onOpen(amendment.id)}
                                    >
                                      {contractCopy.viewFile}{" "}
                                      <ChevronRight size={14} />
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="amendment-empty">
                            <FileText size={22} aria-hidden="true" />
                            <div>
                              <strong>Nenhum documento vinculado</strong>
                              <p>
                                Vincule termos aditivos, contratos de manutenção
                                e anexos ao TC.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!groups.length && (
          <div className="document-empty">
            <FileText size={30} />
            <h3>
              {query
                ? "Nenhum documento contratual encontrado"
                : "TCs, contratos de manutenção e termos aditivos."}
            </h3>
            <p>
              {query
                ? "Busque pelo nome do TC, contrato de manutenção, termo aditivo ou equipamento."
                : "Os Termos de Contrato (TC) enviados no cadastro aparecem aqui. Contratos de manutenção e termos aditivos são opcionais."}
            </p>
          </div>
        )}
      </div>
      {adding && (
        <ContractAttachment
          key={adding.id}
          principal={adding}
          onClose={() => setAdding(null)}
          onSaved={saved}
          onUploaded={onChanged}
        />
      )}
    </section>
  );
}
