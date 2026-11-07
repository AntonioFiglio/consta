import { contractCopy } from "./contract-copy";
import { ManagedDialog } from "./DialogManager";
import { useEffect, useId, useRef, useState } from "react";
import {
  ExternalLink,
  FileText,
  LayoutGrid,
  LoaderCircle,
  Plus,
  ArrowRight,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Asset, ContractSummary } from "./types";
import {
  contractDocumentIds,
  contractFamily,
  assetHasDocument,
  documentKindLabel,
} from "./contract-groups";
import type { OnBreakdown } from "./breakdowns";
import { AssetOverview } from "./AssetOverview";
import { ContractBriefPanel } from "./ContractBriefPanel";
import { ContractOrganization } from "./ContractOrganization";
import { brandAndModel } from "./equipment-identity";
import { api } from "./api";

export const belongsToContract = (asset: Asset, id: string) =>
  assetHasDocument(asset, new Set([id]));
const views = [
  { id: "summary", label: "Visão geral" },
  { id: "document", label: contractCopy.file },
  { id: "assets", label: "Equipamentos" },
] as const;
type View = (typeof views)[number]["id"];
type Resource = {
  id: string;
  contract?: ContractSummary;
  pdfUrl?: string;
  text?: string;
  error?: string;
};

export function ContractViewer({
  contractId,
  assets,
  contracts = [],
  onClose,
  onEditAsset,
  onBreakdown,
  onContract: _onContract,
  onContractChanged,
  initialView = "summary",
}: {
  contractId: string;
  assets: Asset[];
  contracts?: ContractSummary[];
  onClose: () => void;
  onEditAsset?: (asset: Asset) => void;
  onBreakdown?: OnBreakdown;
  onContract?: (id: string) => void;
  onContractChanged?: (contract: ContractSummary) => void;
  initialView?: View;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedId, setSelectedId] = useState(contractId);
  const [treeExpanded, setTreeExpanded] = useState(true);
  const [tab, setTab] = useState<View>(initialView);
  const [resource, setResource] = useState<Resource | null>(null);
  const [retry, setRetry] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [organization, setOrganization] = useState<{
    principal?: ContractSummary;
    document?: ContractSummary;
  } | null>(null);
  const [localContracts, setLocalContracts] = useState<ContractSummary[]>([]);
  const lastAssetButton = useRef<HTMLButtonElement | null>(null);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const current = resource?.id === selectedId ? resource : null;
  const known = new Map(contracts.map((document) => [document.id, document]));
  for (const document of localContracts) known.set(document.id, document);
  if (current?.contract && !known.has(selectedId))
    known.set(selectedId, current.contract);
  const family = contractFamily(selectedId, [...known.values()]);
  const contract = family.selected || current?.contract;
  const documentIds =
    family.principal?.id === selectedId
      ? contractDocumentIds(selectedId, [...known.values()])
      : new Set([selectedId]);
  const units = assets.filter((asset) => assetHasDocument(asset, documentIds));
  const fileUrl = `/api/contracts/${encodeURIComponent(selectedId)}/file`;
  function selectDocument(nextId: string) {
    setSelectedId(nextId);
    setTab("summary");
    setSelectedAsset(null);
  }
  function changed(document: ContractSummary) {
    setLocalContracts((old) => [
      ...old.filter((item) => item.id !== document.id),
      document,
    ]);
    onContractChanged?.(document);
  }
  const closeAsset = () => {
    setSelectedAsset(null);
    requestAnimationFrame(() =>
      lastAssetButton.current?.focus({ preventScroll: true }),
    );
  };
  useEffect(() => {
    setTreeExpanded(true);
  }, [selectedId, family.principal?.id]);
  useEffect(() => {
    selectDocument(contractId);
    setTab(initialView);
  }, [contractId, initialView]);
  useEffect(() => {
    const controller = new AbortController();
    api<ContractSummary[]>("/contracts", { signal: controller.signal })
      .then((documents) => {
        if (controller.signal.aborted) return;
        setLocalContracts((old) => {
          const merged = new Map(
            documents.map((document) => [document.id, document]),
          );
          for (const document of old) merged.set(document.id, document);
          return [...merged.values()];
        });
      })
      .catch(() => {
        /* Os metadados já recebidos continuam disponíveis. */
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setResource({ id: selectedId });
    async function load() {
      try {
        const value = await api<ContractSummary>(
          `/contracts/${encodeURIComponent(selectedId)}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setResource({ id: selectedId, contract: value });
        const response = await fetch(fileUrl, { signal: controller.signal });
        if (!response.ok)
          throw new Error("Não foi possível carregar o arquivo.");
        if (value.mime === "application/pdf") {
          const bytes = await response.arrayBuffer();
          if (controller.signal.aborted) return;
          objectUrl = URL.createObjectURL(
            new Blob([bytes], { type: "application/pdf" }),
          );
          setResource({ id: selectedId, contract: value, pdfUrl: objectUrl });
        } else {
          const text = await response.text();
          if (!controller.signal.aborted)
            setResource({ id: selectedId, contract: value, text });
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setResource((old) => ({
            ...old,
            id: selectedId,
            error: (error as Error).message,
          }));
      }
    }
    void load();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedId, fileUrl, retry]);
  return (
    <ManagedDialog
      onRequestClose={onClose}
      ref={dialog}
      className="document-dialog contract-workspace"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <div className="contract-workspace-layout">
        <aside
          className="contract-document-sidebar"
          aria-label="Arquivos deste contrato"
        >
          <div className="contract-sidebar-heading">
            <FolderOpen size={17} aria-hidden="true" />
            <strong>{contractCopy.files}</strong>
          </div>
          <nav aria-label="Escolher arquivo">
            <ul className="contract-file-tree">
              {family.principal && (
                <li>
                  <div className="contract-tree-root">
                    {family.documents.length > 1 ? (
                      <button
                        type="button"
                        className="contract-tree-toggle"
                        aria-expanded={treeExpanded}
                        aria-controls={`${id}-tree-children`}
                        aria-label={`${treeExpanded ? "Recolher" : "Expandir"} arquivos vinculados`}
                        onClick={() => setTreeExpanded((value) => !value)}
                      >
                        {treeExpanded ? (
                          <ChevronDown size={15} />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </button>
                    ) : (
                      <span className="contract-tree-spacer" />
                    )}
                    <button
                      type="button"
                      className="principal-document"
                      aria-current={
                        selectedId === family.principal.id ? "true" : undefined
                      }
                      onClick={() => selectDocument(family.principal!.id)}
                    >
                      <FileText size={16} aria-hidden="true" />
                      <span>
                        <small>{documentKindLabel(family.principal)}</small>
                        <strong>{family.principal.name}</strong>
                      </span>
                    </button>
                  </div>
                  <ul
                    id={`${id}-tree-children`}
                    className="contract-tree-children"
                    hidden={!treeExpanded}
                  >
                    {family.documents
                      .filter(
                        (document) => document.id !== family.principal!.id,
                      )
                      .map((document) => (
                        <li key={document.id}>
                          <button
                            type="button"
                            className="linked-document"
                            aria-current={
                              selectedId === document.id ? "true" : undefined
                            }
                            onClick={() => selectDocument(document.id)}
                          >
                            <FileText size={15} aria-hidden="true" />
                            <span>
                              <small>{documentKindLabel(document)}</small>
                              <strong>{document.name}</strong>
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </li>
              )}
            </ul>
          </nav>
          {family.principal &&
            family.principal.documentKind !== "outsourced" &&
            family.principal.documentKind !== "complement" && (
              <button
                type="button"
                className="button secondary contract-add-document"
                onClick={() => setOrganization({ principal: family.principal })}
              >
                <Plus size={15} /> {contractCopy.addFile}
              </button>
            )}
        </aside>
        <div className="contract-workspace-main">
          <header className="contract-workspace-header">
            <span>
              {contract ? documentKindLabel(contract) : contractCopy.file}
            </span>
            <h2 id={`${id}-title`}>
              {contract?.name || "Carregando arquivo…"}
            </h2>
            {contract && (
              <p>
                Adicionado em{" "}
                {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </header>
          <div className="contract-view-toolbar">
            <div
              className="equipment-sheet-tabs contract-view-tabs"
              role="tablist"
              aria-label="Informações do contrato"
            >
              {views.map((view, index) => (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  ref={(element) => {
                    tabButtons.current[index] = element;
                  }}
                  id={`${id}-tab-${view.id}`}
                  aria-controls={`${id}-panel-${view.id}`}
                  aria-selected={tab === view.id}
                  tabIndex={tab === view.id ? 0 : -1}
                  onClick={() => setTab(view.id)}
                  onKeyDown={(event) => {
                    const target =
                      event.key === "ArrowRight"
                        ? (index + 1) % views.length
                        : event.key === "ArrowLeft"
                          ? (index + views.length - 1) % views.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? views.length - 1
                              : -1;
                    if (target < 0) return;
                    event.preventDefault();
                    setTab(views[target].id);
                    tabButtons.current[target]?.focus();
                  }}
                >
                  {view.label}
                  {view.id === "assets" && <span>{units.length}</span>}
                </button>
              ))}
            </div>
            <a
              className="text-button contract-open-file"
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir ${contract?.name || "arquivo"} em outra aba`}
            >
              <ExternalLink size={15} /> Abrir em outra aba
            </a>
          </div>
          <div className="contract-workspace-content">
            <div
              role="tabpanel"
              tabIndex={0}
              id={`${id}-panel-summary`}
              aria-labelledby={`${id}-tab-summary`}
              hidden={tab !== "summary"}
              className="contract-summary-panel"
            >
              <ContractBriefPanel
                contractId={selectedId}
                active={tab === "summary"}
                onRead={() => setTab("document")}
              />
              {family.principal && family.principal.id !== selectedId && (
                <button
                  type="button"
                  className="contract-root-shortcut"
                  onClick={() => selectDocument(family.principal!.id)}
                >
                  <FileText size={17} />
                  <span>
                    <small>Contrato de origem</small>
                    <strong>{family.principal.name}</strong>
                  </span>
                  <ArrowRight size={15} />
                </button>
              )}
              {contract && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setOrganization({ document: contract })}
                >
                  Organizar vínculo
                </button>
              )}
            </div>
            <div
              role="tabpanel"
              tabIndex={0}
              id={`${id}-panel-document`}
              aria-labelledby={`${id}-tab-document`}
              hidden={tab !== "document"}
              className="contract-reader-panel"
            >
              {current?.error ? (
                <div className="contract-reader-message">
                  <p className="error-message" role="alert">
                    {current.error}
                  </p>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setRetry((value) => value + 1)}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : !current?.contract ||
                (current.contract.mime === "application/pdf"
                  ? !current.pdfUrl
                  : current.text === undefined) ? (
                <div className="contract-reader-message" role="status">
                  <LoaderCircle size={22} className="spin" /> Carregando
                  arquivo…
                </div>
              ) : current.pdfUrl ? (
                <iframe
                  key={selectedId}
                  title={`Prévia de ${current.contract.name}`}
                  src={current.pdfUrl}
                />
              ) : (
                <pre>{current.text}</pre>
              )}
            </div>
            <div
              role="tabpanel"
              tabIndex={0}
              id={`${id}-panel-assets`}
              aria-labelledby={`${id}-tab-assets`}
              hidden={tab !== "assets"}
              className="contract-assets-panel"
            >
              <div className="document-equipment-list">
                <p className="section-description">
                  {selectedId !== family.principal?.id
                    ? "Equipamentos vinculados ao arquivo selecionado."
                    : "Equipamentos do principal e dos arquivos vinculados, sem duplicações."}
                </p>
                {units.length ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Equipamento</th>
                        <th>Número de tombamento</th>
                        <th>Setor</th>
                        <th>Período do contrato</th>
                        <th>Revisão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((asset) => {
                        const plans =
                          asset.coverages?.filter(
                            (plan) =>
                              plan.contractId &&
                              documentIds.has(plan.contractId),
                          ) || [];
                        const documentOnly = asset.maintenanceDocuments?.some(
                          (record) => documentIds.has(record.contractId),
                        );
                        const reviewed = plans.length
                          ? plans.every((plan) => plan.reviewed)
                          : !documentOnly && asset.reviewed;
                        return (
                          <tr
                            key={asset.id}
                            className={
                              selectedAsset?.id === asset.id
                                ? "contract-equipment-selected"
                                : ""
                            }
                          >
                            <td>
                              <button
                                className="text-button"
                                onClick={(event) => {
                                  lastAssetButton.current = event.currentTarget;
                                  setSelectedAsset(asset);
                                }}
                              >
                                {asset.name}
                              </button>
                              <small className="inventory-serial">
                                {brandAndModel(asset) ||
                                  "Marca e modelo não informados"}
                              </small>
                            </td>
                            <td className="mono">{asset.patrimony}</td>
                            <td>{asset.sector || "—"}</td>
                            <td>
                              {plans.length
                                ? plans.map((plan) => (
                                    <div key={plan.id}>
                                      {documentIds.size > 1 && (
                                        <small className="equipment-secondary">
                                          {plan.contractName ||
                                            contracts.find(
                                              (item) =>
                                                item.id === plan.contractId,
                                            )?.name ||
                                            "Arquivo vinculado"}
                                        </small>
                                      )}
                                      {plan.validFrom
                                        ? new Date(
                                            plan.validFrom + "T12:00:00",
                                          ).toLocaleDateString("pt-BR")
                                        : "Início não informado"}{" "}
                                      ·{" "}
                                      {plan.validUntil
                                        ? new Date(
                                            plan.validUntil + "T12:00:00",
                                          ).toLocaleDateString("pt-BR")
                                        : "Fim não informado"}
                                    </div>
                                  ))
                                : "Datas do contrato não informadas"}
                            </td>
                            <td>
                              <span
                                className={`badge ${reviewed ? "reviewed" : "warning"}`}
                              >
                                {reviewed
                                  ? "Dados conferidos"
                                  : "Dados a conferir"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="document-empty">
                    <LayoutGrid size={28} />
                    <h3>Nenhum equipamento vinculado</h3>
                    <p>
                      O arquivo está salvo. As unidades aparecem aqui após
                      confirmar o cadastro.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedAsset && (
        <AssetOverview
          asset={
            assets.find((asset) => asset.id === selectedAsset.id) ||
            selectedAsset
          }
          today={today}
          floating
          containerRef={dialog}
          onBreakdown={onBreakdown}
          onClose={closeAsset}
          onEdit={
            onEditAsset
              ? () =>
                  onEditAsset(
                    assets.find((asset) => asset.id === selectedAsset.id) ||
                      selectedAsset,
                  )
              : undefined
          }
          onContract={(nextId) => {
            closeAsset();
            selectDocument(nextId);
          }}
        />
      )}
      {organization && (
        <ContractOrganization
          key={organization.document?.id || organization.principal?.id}
          {...organization}
          contracts={[...known.values()]}
          onClose={() => setOrganization(null)}
          onUploaded={changed}
          onSaved={(document) => {
            changed(document);
            setOrganization(null);
            selectDocument(document.id);
          }}
        />
      )}
    </ManagedDialog>
  );
}
