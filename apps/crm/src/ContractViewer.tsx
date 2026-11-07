import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  FileText,
  LayoutGrid,
  LoaderCircle,
  X,
} from "lucide-react";
import type { Asset, ContractSummary } from "./types";
import { AssetOverview } from "./AssetOverview";
import { api } from "./api";

export const belongsToContract = (asset: Asset, id: string) =>
  asset.contractId === id ||
  Boolean(asset.coverages?.some((plan) => plan.contractId === id));

export function ContractViewer({
  contractId,
  assets,
  onClose,
  onEditAsset,
  onContract,
}: {
  contractId: string;
  assets: Asset[];
  onClose: () => void;
  onEditAsset?: (asset: Asset) => void;
  onContract?: (id: string) => void;
}) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const lastAssetButton = useRef<HTMLButtonElement | null>(null);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const closeAsset = () => {
    setSelectedAsset(null);
    requestAnimationFrame(() =>
      lastAssetButton.current?.focus({ preventScroll: true }),
    );
  };
  const dialog = useRef<HTMLDialogElement>(null);
  const [contract, setContract] = useState<ContractSummary | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"document" | "assets">("assets");
  const units = assets.filter((asset) => belongsToContract(asset, contractId));
  const fileUrl = `/api/contracts/${encodeURIComponent(contractId)}/file`;
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setContract(null);
    setText(null);
    setPdfUrl(null);
    setError("");
    setTab("assets");
    setSelectedAsset(null);
    api<ContractSummary>(`/contracts/${encodeURIComponent(contractId)}`, {
      signal: controller.signal,
    })
      .then(async (value) => {
        if (controller.signal.aborted) return;
        setContract(value);
        const response = await fetch(fileUrl, { signal: controller.signal });
        if (!response.ok)
          throw new Error(
            "Não foi possível carregar o documento. Tente abrir novamente.",
          );
        if (value.mime === "application/pdf") {
          const bytes = await response.arrayBuffer();
          if (controller.signal.aborted) return;
          objectUrl = URL.createObjectURL(
            new Blob([bytes], { type: "application/pdf" }),
          );
          setPdfUrl(objectUrl);
        } else {
          const content = await response.text();
          if (!controller.signal.aborted) setText(content);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contractId, fileUrl]);
  return (
    <dialog
      ref={dialog}
      className="document-dialog"
      aria-labelledby="document-title"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedAsset) closeAsset();
        else onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <header className="document-header">
        <div>
          <span className="eyebrow">CONTRATO</span>
          <h2 id="document-title">
            {contract?.name || "Carregando documento…"}
          </h2>
          <p>
            {contract
              ? `Adicionado em ${new Date(contract.createdAt).toLocaleDateString("pt-BR")}`
              : "Consultando arquivo"}
          </p>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar prévia do contrato"
        >
          <X size={20} />
        </button>
      </header>
      <div className="document-toolbar">
        <div className="document-switch" aria-label="Visualização do contrato">
          <button
            aria-pressed={tab === "assets"}
            onClick={() => setTab("assets")}
          >
            <LayoutGrid size={15} /> Equipamentos <span>{units.length}</span>
          </button>
          <button
            aria-pressed={tab === "document"}
            onClick={() => setTab("document")}
          >
            <FileText size={15} /> Documento
          </button>
        </div>
        <a
          className="text-button"
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
        >
          Abrir arquivo <ExternalLink size={14} />
        </a>
      </div>
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : !contract ? (
        <div className="document-loading" role="status">
          <LoaderCircle size={22} className="spin" /> Carregando contrato…
        </div>
      ) : tab === "document" ? (
        <div className="document-preview">
          {contract.mime === "application/pdf" ? (
            pdfUrl ? (
              <iframe title={`Prévia de ${contract.name}`} src={pdfUrl} />
            ) : (
              <p role="status">Carregando PDF…</p>
            )
          ) : text === null ? (
            <p role="status">Carregando texto…</p>
          ) : (
            <pre>{text}</pre>
          )}
        </div>
      ) : (
        <div className="document-equipment-list">
          <p className="section-description">
            Unidades cadastradas vinculadas a este documento, incluindo
            coberturas anteriores.
          </p>
          {units.length ? (
            <table>
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Número de tombamento</th>
                  <th>Setor</th>
                  <th>Cobertura neste contrato</th>
                  <th>Revisão</th>
                </tr>
              </thead>
              <tbody>
                {units.map((asset) => {
                  const plans =
                    asset.coverages?.filter(
                      (plan) => plan.contractId === contractId,
                    ) || [];
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
                          {asset.model || "Modelo não informado"}
                        </small>
                      </td>
                      <td className="mono">{asset.patrimony}</td>
                      <td>{asset.sector || "—"}</td>
                      <td>
                        {plans.length
                          ? plans.map((plan) => (
                              <div key={plan.id}>
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
                          : "Vigência não informada"}
                      </td>
                      <td>
                        <span
                          className={`badge ${plans.length ? (plans.every((plan) => plan.reviewed) ? "reviewed" : "warning") : asset.reviewed ? "reviewed" : "warning"}`}
                        >
                          {(
                            plans.length
                              ? plans.every((plan) => plan.reviewed)
                              : asset.reviewed
                          )
                            ? "Conferido"
                            : "Pendente"}
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
                O documento está salvo. As unidades aparecem aqui após confirmar
                o cadastro.
              </p>
            </div>
          )}
        </div>
      )}
      <footer className="document-footer">
        <span>Documento original preservado</span>
        <button className="button secondary" onClick={onClose}>
          Fechar
        </button>
      </footer>
      {selectedAsset && (
        <AssetOverview
          asset={selectedAsset}
          today={today}
          floating
          containerRef={dialog}
          onClose={closeAsset}
          onEdit={onEditAsset ? () => onEditAsset(selectedAsset) : undefined}
          onContract={(id) => {
            closeAsset();
            if (id === contractId) setTab("document");
            else if (onContract) onContract(id);
          }}
        />
      )}
    </dialog>
  );
}
