import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  Asset,
  Contract,
  Evidence,
  Extraction,
  PeriodUnit,
} from "./types";
import { api } from "./api";

type Form = {
  name: string;
  patrimony: string;
  serial: string;
  sector: string;
  model: string;
  periodValue: string;
  periodUnit: PeriodUnit;
  anchorDate: string;
  anchorType: string;
  notes: string;
  reviewed: boolean;
};
const empty: Form = {
  name: "",
  patrimony: "",
  serial: "",
  sector: "",
  model: "",
  periodValue: "",
  periodUnit: "months",
  anchorDate: "",
  anchorType: "Instalação",
  notes: "",
  reviewed: false,
};
const labels: Record<Exclude<keyof Extraction, "warnings">, string> = {
  equipment: "Equipamento",
  model: "Modelo",
  periodValue: "Intervalo",
  periodUnit: "Unidade do intervalo",
  anchorDate: "Data de referência",
  anchorType: "Marco inicial",
};
const fieldValue = (field: Evidence) =>
  field.status === "found" ? field.value || "" : "";

export function AssetDialog({
  asset,
  aiReady,
  onClose,
  onSaved,
}: {
  asset: Asset | null;
  aiReady: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<1 | 2>(asset ? 2 : 1);
  const [form, setForm] = useState<Form>(() =>
    asset
      ? {
          ...asset,
          periodValue: String(asset.periodValue || ""),
          anchorDate: asset.anchorDate || "",
        }
      : empty,
  );
  const [contract, setContract] = useState<Contract | null>(null);
  const [busy, setBusy] = useState<"upload" | "extract" | "save" | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [contractLoading, setContractLoading] = useState(
    Boolean(asset?.contractId),
  );
  useEffect(() => {
    dialog.current?.showModal();
    if (asset?.contractId)
      api<Contract>(`/contracts/${asset.contractId}`)
        .then(setContract)
        .catch((e) => setError(e.message))
        .finally(() => setContractLoading(false));
  }, [asset]);
  useEffect(() => {
    dialog.current?.scrollTo({ top: 0 });
    stepHeading.current?.focus({ preventScroll: true });
  }, [step]);
  function goToStep(next: 1 | 2) {
    setError("");
    setStep(next);
  }
  function change<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((old) => ({
      ...old,
      [key]: value,
      ...(key !== "reviewed" ? { reviewed: false } : {}),
    }));
  }
  function applyExtraction(data: Extraction) {
    setForm((old) => ({
      ...old,
      name: fieldValue(data.equipment) || old.name,
      model: fieldValue(data.model) || old.model,
      periodValue:
        /^\d+$/.test(fieldValue(data.periodValue)) &&
        ["days", "months", "years"].includes(fieldValue(data.periodUnit))
          ? fieldValue(data.periodValue)
          : "",
      periodUnit: ["days", "months", "years"].includes(
        fieldValue(data.periodUnit),
      )
        ? (fieldValue(data.periodUnit) as PeriodUnit)
        : "months",
      anchorDate: /^\d{4}-\d{2}-\d{2}$/.test(fieldValue(data.anchorDate))
        ? fieldValue(data.anchorDate)
        : "",
      anchorType: fieldValue(data.anchorType),
      reviewed: false,
    }));
  }
  async function upload(file?: File) {
    if (!file || busy) return;
    if (file.size > 15 * 1024 * 1024 || !/\.(pdf|txt)$/i.test(file.name)) {
      setError("Selecione um PDF ou TXT de até 15 MB.");
      return;
    }
    setError("");
    setBusy("upload");
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await api<Contract>("/contracts", {
        method: "POST",
        body,
      });
      setContract(uploaded);
      if (uploaded.id !== (contract?.id || asset?.contractId)) {
        setForm((old) => ({
          ...old,
          periodValue: "",
          anchorDate: "",
          anchorType: "",
          reviewed: false,
        }));
        if (uploaded.extraction) applyExtraction(uploaded.extraction);
      }
      setEvidenceOpen(false);
      change("reviewed", false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  }
  async function extract() {
    if (!contract) return;
    setError("");
    setBusy("extract");
    try {
      const result = await api<Contract>(`/contracts/${contract.id}/extract`, {
        method: "POST",
      });
      setContract(result);
      setEvidenceOpen(false);
      applyExtraction(result.extraction!);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  async function nextStep() {
    if (!contract || busy || contractLoading) return;
    if (aiReady && !contract.extraction && !(await extract())) return;
    goToStep(2);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (step === 1) {
      await nextStep();
      return;
    }
    if (busy || contractLoading) return;
    setBusy("save");
    setError("");
    try {
      await api(`/assets${asset ? `/${asset.id}` : ""}`, {
        method: asset ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          periodValue: form.periodValue ? Number(form.periodValue) : null,
          anchorDate: form.anchorDate || null,
          contractId: contract?.id || asset?.contractId || null,
        }),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }
  const canReview = Boolean(
    form.anchorDate && form.periodValue && form.anchorType,
  );
  return (
    <dialog
      ref={dialog}
      className="asset-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-body">
        <header className="dialog-header">
          <div>
            <h2 id="dialog-title">
              {step === 1
                ? "Envie o contrato"
                : asset
                  ? "Editar equipamento"
                  : "Confira os dados"}
            </h2>
            <p>
              {step === 1
                ? "Selecione o PDF do equipamento."
                : "Confirme as informações e salve o equipamento."}
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            disabled={Boolean(busy)}
            aria-label="Fechar cadastro"
          >
            <X size={20} />
          </button>
        </header>
        <form onSubmit={save}>
          <fieldset disabled={Boolean(busy) || contractLoading}>
            {step === 1 ? (
              <section className="form-section contract-step">
                <div className="visually-hidden">
                  <h3 ref={stepHeading} tabIndex={-1}>
                    Envie o contrato
                  </h3>
                </div>
                <input
                  className="visually-hidden"
                  ref={input}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  aria-label="Selecionar contrato"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className={`dropzone ${dragging ? "dragging" : ""}`}
                  onClick={() => input.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    upload(e.dataTransfer.files[0]);
                  }}
                >
                  <div className="upload-icon">
                    {busy === "upload" ? (
                      <LoaderCircle className="spin" size={23} />
                    ) : contract ? (
                      <FileText size={23} />
                    ) : (
                      <UploadCloud size={23} />
                    )}
                  </div>
                  <strong>
                    {contractLoading
                      ? "Carregando contrato…"
                      : busy === "upload"
                        ? "Salvando contrato…"
                        : contract?.name || "Arraste o PDF aqui"}
                  </strong>
                  <span>
                    {contract ? (
                      "Clique para trocar o arquivo"
                    ) : (
                      <>ou clique para selecionar</>
                    )}
                  </span>
                  <small>PDF ou TXT · até 15 MB</small>
                </button>
              </section>
            ) : (
              <>
                <section className="form-section">
                  <div className="step-contract-summary">
                    <FileText size={18} />
                    <div>
                      <strong>{contract?.name || "Cadastro manual"}</strong>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => goToStep(1)}
                    >
                      {contract ? "Trocar" : "Adicionar contrato"}
                    </button>
                  </div>
                  <div className="section-caption">
                    <h3
                      ref={stepHeading}
                      tabIndex={-1}
                      className="visually-hidden"
                    >
                      Identifique o equipamento
                    </h3>
                  </div>
                  {contract?.extraction && (
                    <details
                      className="evidence"
                      open={evidenceOpen}
                      onToggle={(e) => setEvidenceOpen(e.currentTarget.open)}
                    >
                      <summary>
                        <Sparkles size={15} /> Ver informações do contrato
                      </summary>
                      <div className="evidence-content">
                        {Object.entries(labels).map(([key, label]) => {
                          const field =
                            contract.extraction![key as keyof typeof labels];
                          return (
                            <div key={key} className="evidence-field">
                              <div>
                                <strong>{label}</strong>
                                <span
                                  className={`badge ${field.status === "found" ? "neutral" : "warning"}`}
                                >
                                  {field.status === "found"
                                    ? field.value
                                    : field.status === "conflict"
                                      ? "Conflito — revisar"
                                      : "Não encontrado"}
                                </span>
                              </div>
                              {field.quote && (
                                <blockquote>“{field.quote}”</blockquote>
                              )}
                              {field.page && (
                                <a
                                  href={`/api/contracts/${contract.id}/file#page=${field.page}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Página {field.page} ↗
                                </a>
                              )}
                            </div>
                          );
                        })}
                        {contract.extraction.warnings.map((warning, index) => (
                          <p className="evidence-warning" key={index}>
                            {warning}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  <div className="form-grid">
                    <label className="full">
                      Equipamento <span>*</span>
                      <input
                        autoComplete="off"
                        required
                        maxLength={160}
                        value={form.name}
                        onChange={(e) => change("name", e.target.value)}
                        placeholder="Ex.: Bomba de infusão"
                      />
                    </label>
                    <label className="full">
                      Patrimônio <span>*</span>
                      <input
                        required
                        maxLength={80}
                        value={form.patrimony}
                        onChange={(e) => change("patrimony", e.target.value)}
                        placeholder="Número da etiqueta institucional"
                      />
                      <small>
                        Número da etiqueta do governo ou da instituição.
                      </small>
                    </label>
                  </div>
                </section>
                <section className="form-section">
                  <div className="section-caption">
                    <h3>Manutenção</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      Manutenção a cada
                      <div className="input-pair">
                        <input
                          type="number"
                          min={1}
                          max={366}
                          step={1}
                          value={form.periodValue}
                          onChange={(e) =>
                            change("periodValue", e.target.value)
                          }
                          placeholder="6"
                          aria-label="Intervalo de manutenção"
                        />
                        <select
                          aria-label="Unidade do intervalo"
                          value={form.periodUnit}
                          onChange={(e) =>
                            change("periodUnit", e.target.value as PeriodUnit)
                          }
                        >
                          <option value="months">meses</option>
                          <option value="days">dias</option>
                          <option value="years">anos</option>
                        </select>
                      </div>
                    </label>
                    <label>
                      Data inicial
                      <input
                        type="date"
                        min="1900-01-01"
                        max="2200-12-31"
                        value={form.anchorDate}
                        onChange={(e) => change("anchorDate", e.target.value)}
                      />
                    </label>
                    <label className="full">
                      Essa data corresponde a
                      <input
                        maxLength={160}
                        value={form.anchorType}
                        onChange={(e) => change("anchorType", e.target.value)}
                        placeholder="Ex.: Instalação ou última manutenção"
                      />
                      <small>
                        A data de envio do contrato não define o início do
                        ciclo.
                      </small>
                    </label>
                  </div>
                  <details className="optional-fields">
                    <summary>
                      Mais informações <span>opcional</span>
                    </summary>
                    <div className="form-grid">
                      <label>
                        Número de série{" "}
                        <span className="optional">opcional</span>
                        <input
                          maxLength={100}
                          value={form.serial}
                          onChange={(e) => change("serial", e.target.value)}
                          placeholder="Identificação do fabricante"
                        />
                      </label>
                      <label>
                        Modelo
                        <input
                          maxLength={160}
                          value={form.model}
                          onChange={(e) => change("model", e.target.value)}
                          placeholder="Modelo do equipamento"
                        />
                      </label>
                      <label>
                        Setor
                        <input
                          maxLength={100}
                          value={form.sector}
                          onChange={(e) => change("sector", e.target.value)}
                          placeholder="Ex.: UTI — Ala A"
                        />
                      </label>
                      <label className="full">
                        Observações
                        <textarea
                          rows={2}
                          maxLength={4000}
                          value={form.notes}
                          onChange={(e) => change("notes", e.target.value)}
                          placeholder="Condições do contrato ou informações que faltam conferir."
                        />
                      </label>
                    </div>
                  </details>
                  <label
                    className={`review-box ${form.reviewed ? "is-reviewed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.reviewed}
                      disabled={!canReview}
                      onChange={(e) => change("reviewed", e.target.checked)}
                    />
                    <span>
                      <strong>Conferi os dados de manutenção</strong>
                      <small>
                        {canReview
                          ? "As datas aparecerão no calendário após salvar."
                          : "Preencha os dados acima para ativar as previsões."}
                      </small>
                    </span>
                    {form.reviewed && <CheckCircle2 size={20} />}
                  </label>
                </section>
              </>
            )}
          </fieldset>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <footer className="dialog-footer">
            <div key={step}>
              {step === 1 ? (
                <>
                  <button
                    type="button"
                    className="text-button manual-entry"
                    disabled={Boolean(busy) || contractLoading}
                    onClick={() => goToStep(2)}
                  >
                    {contract
                      ? "Preencher manualmente"
                      : "Preencher sem contrato"}
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    disabled={!contract || Boolean(busy) || contractLoading}
                    onClick={(event) => {
                      event.preventDefault();
                      void nextStep();
                    }}
                  >
                    {busy ? (
                      <LoaderCircle size={16} className="spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    {busy === "extract"
                      ? "Lendo contrato…"
                      : busy === "upload"
                        ? "Enviando…"
                        : "Continuar"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="button secondary"
                    disabled={Boolean(busy)}
                    onClick={() => goToStep(1)}
                  >
                    <ArrowLeft size={15} />
                    Voltar
                  </button>
                  <button
                    className="button primary"
                    disabled={Boolean(busy) || contractLoading}
                    type="submit"
                  >
                    {busy === "save" ? (
                      <LoaderCircle size={16} className="spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    {busy === "save" ? "Salvando…" : "Salvar equipamento"}
                  </button>
                </>
              )}
            </div>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
