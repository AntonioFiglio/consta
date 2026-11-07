import { contractCopy } from "./contract-copy";
import { ManagedDialog } from "./DialogManager";
import { useId, useRef, useState } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import type {
  Contract,
  ContractSummary,
  MaintenanceDocumentKind,
} from "./types";
import { api } from "./api";

export function ContractAttachment({
  principal,
  onClose,
  onSaved,
  onUploaded,
}: {
  principal: ContractSummary;
  onClose: () => void;
  onSaved: (contract: ContractSummary) => void;
  onUploaded: (contract: ContractSummary) => void;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] =
    useState<Exclude<MaintenanceDocumentKind, "contract">>("amendment");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploadedId = useRef<string | null>(null);
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
        if (uploaded.id === principal.id)
          throw new Error(
            "Este arquivo já é o Termo de Contrato (TC) principal. Escolha outro documento.",
          );
        if (
          uploaded.parentContractId &&
          uploaded.parentContractId !== principal.id
        )
          throw new Error(
            "Este documento já está vinculado a outro TC. Escolha um documento sem vínculo.",
          );
        uploadedId.current = uploaded.id;
      }
      const id = uploadedId.current;
      onSaved(
        await api<ContractSummary>(`/contracts/${id}/parent`, {
          method: "PATCH",
          body: JSON.stringify({
            parentContractId: principal.id,
            documentKind: kind,
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
      className="contract-attachment-dialog contract-link-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <header className="contract-workspace-header">
        <div>
          <span>Novo documento vinculado</span>
          <h2 id={titleId}>{contractCopy.addFile}</h2>
          <p>{principal.name}</p>
        </div>
      </header>
      <form onSubmit={save}>
        <fieldset disabled={busy} className="contract-attachment-fields">
          <div className="contract-link-context">
            <span>Termo de Contrato (TC) vinculado</span>
            <strong>{principal.name}</strong>
          </div>
          <label>
            {contractCopy.fileType}
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as typeof kind)}
            >
              <option value="amendment">{contractCopy.amendment}</option>
              <option value="outsourced">{contractCopy.maintenance}</option>
              <option value="complement">{contractCopy.annex}</option>
            </select>
          </label>
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
            <strong>{file?.name || "Selecione o documento"}</strong>
            <span>
              {file
                ? "Clique para trocar"
                : "Clique para selecionar ou arraste um PDF ou TXT"}
            </span>
          </button>
          <p className="field-hint">
            Vincular o documento ao TC preserva os planos de manutenção
            existentes.
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
            disabled={busy || !file}
          >
            {busy && <LoaderCircle size={15} className="spin" />}
            {busy ? "Salvando…" : contractCopy.addFile}
          </button>
        </footer>
      </form>
    </ManagedDialog>
  );
}
