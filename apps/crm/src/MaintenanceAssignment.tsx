import { contractCopy } from "./contract-copy";
import { ManagedDialog } from "./DialogManager";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Building2,
  FilePenLine,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";
import type { Asset, MaintenanceProvider } from "./types";
import { maintenanceProviderFor } from "./maintenance-status";
import { api } from "./api";

export function MaintenanceAssignment({
  asset,
  onClose,
  onSaved,
}: {
  asset: Asset;
  onClose: () => void;
  onSaved: (asset: Asset) => void;
  onOpenDocument?: (id: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [provider, setProvider] = useState<MaintenanceProvider>(() =>
    maintenanceProviderFor(asset),
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [kind, setKind] = useState<"amendment" | "outsourced">("amendment");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [step]);
  function selectFile(selected?: File) {
    if (!selected) return;
    if (
      !selected.size ||
      selected.size > 15 * 1024 * 1024 ||
      !/\.(pdf|txt)$/i.test(selected.name)
    ) {
      setError("Escolha um PDF ou TXT não vazio, com até 15 MB.");
      return;
    }
    setFile(selected);
    setError("");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (step === 1 && provider === "contract") {
      setError("");
      setStep(2);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (step === 2) {
        if (!file) throw new Error("Selecione o arquivo de manutenção.");
        const body = new FormData();
        body.append("file", file);
        body.append("kind", kind);
        onSaved(
          await api<Asset>(`/assets/${asset.id}/maintenance-documents`, {
            method: "POST",
            body,
          }),
        );
      } else
        onSaved(
          await api<Asset>(`/assets/${asset.id}/maintenance-responsibility`, {
            method: "PATCH",
            body: JSON.stringify({ maintenanceProvider: provider }),
          }),
        );
    } catch (error) {
      setError((error as Error).message);
      setBusy(false);
    }
  }
  return (
    <ManagedDialog
      closeDisabled={busy}
      onRequestClose={onClose}
      ref={dialog}
      className="maintenance-assignment-dialog"
      aria-labelledby="assignment-title"
    >
      <header className="document-header">
        <div>
          <h2 id="assignment-title" ref={title} tabIndex={-1}>
            {step === 1
              ? "Quem é responsável pela manutenção?"
              : "Documento de manutenção"}
          </h2>
          <p>
            {asset.name} · Tombamento {asset.patrimony || "pendente"}
          </p>
        </div>
      </header>
      <form onSubmit={submit}>
        {step === 1 ? (
          <fieldset disabled={busy} className="maintenance-options">
            <legend className="visually-hidden">
              Responsável pela manutenção
            </legend>
            {(
              [
                [
                  "contract",
                  "Empresa de manutenção",
                  "Atendimento previsto em contrato de manutenção ou termo aditivo.",
                ],
                [
                  "internal",
                  "Oficina do hospital",
                  "A equipe interna cuida da manutenção.",
                ],
                [
                  "unassigned",
                  "Ainda não definido",
                  "O equipamento continuará com uma pendência.",
                ],
              ] as const
            ).map(([value, label, hint]) => (
              <label
                key={value}
                className={provider === value ? "selected" : undefined}
              >
                <input
                  type="radio"
                  name="maintenance-provider"
                  value={value}
                  checked={provider === value}
                  onChange={() => setProvider(value)}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <fieldset disabled={busy} className="maintenance-document-fields">
            <legend className="visually-hidden">
              Arquivo para o histórico do equipamento
            </legend>
            <div className="maintenance-document-choice">
              <span
                id="maintenance-document-type-label"
                className="maintenance-field-label"
              >
                Tipo de documento
              </span>
              <div
                className="document-switch maintenance-document-switch"
                role="group"
                aria-labelledby="maintenance-document-type-label"
              >
                <button
                  type="button"
                  aria-pressed={kind === "amendment"}
                  onClick={() => setKind("amendment")}
                >
                  <FilePenLine size={15} aria-hidden="true" />
                  {contractCopy.amendment}
                </button>
                <button
                  type="button"
                  aria-pressed={kind === "outsourced"}
                  onClick={() => setKind("outsourced")}
                >
                  <Building2 size={15} aria-hidden="true" />
                  {contractCopy.maintenance}
                </button>
              </div>
              <p className="maintenance-document-hint">
                {kind === "amendment"
                  ? "Altera o prazo, o valor ou as condições de um contrato existente."
                  : "Define a empresa, os serviços e o período de atendimento dos equipamentos."}
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              className="visually-hidden"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
            <button
              type="button"
              className={`dropzone maintenance-document-upload ${dragging ? "dragging" : ""}`}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                selectFile(event.dataTransfer.files[0]);
              }}
            >
              <span className="upload-icon" aria-hidden="true">
                {file ? <FileText size={23} /> : <UploadCloud size={23} />}
              </span>
              <strong>{file?.name || "Selecione o documento de manutenção"}</strong>
              <span>
                {file ? "Clique para trocar" : "Clique para selecionar ou arraste o arquivo"}
              </span>
              <small>
                {file
                  ? file.size < 1024 * 1024
                    ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : "PDF ou TXT · até 15 MB"}
              </small>
            </button>
          </fieldset>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <footer className="document-footer">
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setError("");
              } else onClose();
            }}
          >
            {step === 2 && <ArrowLeft size={14} />}
            {step === 2 ? "Voltar" : "Cancelar"}
          </button>
          <button
            className="button primary"
            disabled={busy || (step === 2 && !file)}
          >
            {busy ? (
              <LoaderCircle size={14} className="spin" />
            ) : step === 1 && provider === "contract" ? (
              <ArrowRight size={14} />
            ) : null}
            {busy
              ? "Salvando…"
              : step === 2
                ? "Salvar no histórico"
                : provider === "contract"
                  ? "Continuar"
                  : "Salvar"}
          </button>
        </footer>
      </form>
    </ManagedDialog>
  );
}
