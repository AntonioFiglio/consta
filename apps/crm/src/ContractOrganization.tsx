import { contractCopy } from "./contract-copy";
import { ManagedDialog } from "./DialogManager";
import { useRef, useState } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import type { Contract, ContractSummary, MaintenanceDocumentKind } from "./types";
import { api } from "./api";

export function ContractOrganization({
  contracts,
  document,
  principal,
  onClose,
  onSaved,
  onUploaded,
}: {
  contracts: ContractSummary[];
  document?: ContractSummary;
  principal?: ContractSummary;
  onClose: () => void;
  onSaved: (contract: ContractSummary) => void;
  onUploaded: (contract: ContractSummary) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [parentId, setParentId] = useState(
    document?.parentContractId || principal?.id || "",
  );
  const [existingId, setExistingId] = useState("");
  const [kind, setKind] = useState<Exclude<MaintenanceDocumentKind, "contract">>(document?.documentKind === "outsourced" || document?.documentKind === "complement" ? document.documentKind : "amendment");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<"upload" | "existing">("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploadedId = useRef<string | null>(null);
  const mains = contracts.filter(
    (contract) =>
      !contract.parentContractId &&
      contract.documentKind !== "complement" &&
      contract.documentKind !== "outsourced" &&
      contract.id !== document?.id,
  );
  const available = contracts.filter(
    (contract) =>
      contract.id !== principal?.id &&
      !contract.parentContractId &&
      !contracts.some((item) => item.parentContractId === contract.id),
  );
  function selectFile(selected?: File) {
    if (!selected) return;
    if (
      !/\.(pdf|txt)$/i.test(selected.name) ||
      !selected.size ||
      selected.size > 15 * 1024 * 1024
    ) {
      setError("Escolha um PDF ou TXT de até 15 MB.");
      return;
    }
    setFile(selected);
    uploadedId.current = null;
    setError("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let id = document?.id || existingId;
      if (!document && source === "upload") {
        if (!file) throw new Error("Selecione o arquivo.");
        if (!uploadedId.current) {
          const body = new FormData();
          body.append("file", file);
          const uploaded = await api<Contract>("/contracts", {
            method: "POST",
            body,
          });
          const { extraction: _extraction, ...summary } = uploaded;
          onUploaded(summary);
          if (uploaded.id === principal?.id)
            throw new Error(
              "Este arquivo é o contrato principal. Escolha outro arquivo.",
            );
          if (
            uploaded.parentContractId &&
            uploaded.parentContractId !== principal?.id
          )
            throw new Error(
              "Este arquivo já está vinculado a outro contrato. Use Organizar para alterar o vínculo.",
            );
          uploadedId.current = uploaded.id;
        }
        id = uploadedId.current!;
      }
      if (!id) throw new Error("Escolha outro arquivo.");
      onSaved(
        await api<ContractSummary>(`/contracts/${id}/parent`, {
          method: "PATCH",
          body: JSON.stringify({
            parentContractId: parentId || null,
            ...(!document ? { documentKind: kind } : {}),
          }),
        }),
      );
    } catch (error) {
      setError((error as Error).message);
      setBusy(false);
    }
  }
  return (
    <ManagedDialog
      closeDisabled={Boolean(busy)}
      onRequestClose={onClose}
      ref={dialog}
      className="contract-organization-dialog contract-link-dialog"
      aria-labelledby="organization-title"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <header className="contract-workspace-header">
        <div>
          <span>{document ? "Organização" : "Novo arquivo vinculado"}</span>
          <h2 id="organization-title">
            {document ? "Organizar vínculo" : contractCopy.addFile}
          </h2>
          <p>{document?.name || principal?.name}</p>
        </div>
      </header>
      <form onSubmit={save}>
        <fieldset disabled={busy} className="contract-organization-fields">
          <div className="contract-link-context"><span>Contrato de origem</span><strong>{principal?.name || mains.find(item => item.id === parentId)?.name || "Arquivo independente"}</strong></div>
          {!document && <label>{contractCopy.fileType}<select value={kind} onChange={event => setKind(event.target.value as typeof kind)}>
            <option value="amendment">Termo aditivo</option>
            <option value="outsourced">Contrato terceirizado</option>
            <option value="complement">Anexo</option>
          </select></label>}
          {document ? (
            <label>
              Contrato de origem
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <option value="">
                  {document.documentKind === "outsourced"
                    ? "Sem vínculo"
                    : "Contrato principal"}
                </option>
                {mains.map((main) => (
                  <option value={main.id} key={main.id}>
                    {document.documentKind === "outsourced"
                      ? "Relacionado a"
                      : "Aditivo de"}{" "}
                    {main.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <div className="document-switch" aria-label="Origem do arquivo">
                <button
                  type="button"
                  aria-pressed={source === "upload"}
                  onClick={() => setSource("upload")}
                >
                  Enviar arquivo
                </button>
                <button
                  type="button"
                  aria-pressed={source === "existing"}
                  onClick={() => setSource("existing")}
                >
                  Escolher arquivo salvo
                </button>
              </div>
              {source === "upload" ? (
                <>
                  <input
                    ref={input}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    className="visually-hidden"
                    onChange={(event) => selectFile(event.target.files?.[0])}
                  />
                  <button
                    type="button"
                    className="amendment-upload"
                    onClick={() => input.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      selectFile(event.dataTransfer.files[0]);
                    }}
                  >
                    <UploadCloud size={24} />
                    <strong>{file?.name || "Arraste o arquivo aqui"}</strong>
                    <span>
                      {file
                        ? "Clique para trocar"
                        : "ou selecione um PDF ou TXT"}
                    </span>
                  </button>
                </>
              ) : (
                <label>
                  Arquivo
                  <select
                    required
                    value={existingId}
                    onChange={(event) => setExistingId(event.target.value)}
                  >
                    <option value="">Selecione o arquivo</option>
                    {available.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          <p className="field-hint">
            Vincular o arquivo preserva os planos de manutenção existentes.
          </p>
        </fieldset>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <footer className="document-footer">
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="button primary"
            disabled={busy || (!document && source === "upload" && !file)}
          >
            {busy && <LoaderCircle size={15} className="spin" />}
            {busy ? "Salvando…" : document ? "Salvar" : contractCopy.addFile}
          </button>
        </footer>
      </form>
    </ManagedDialog>
  );
}
