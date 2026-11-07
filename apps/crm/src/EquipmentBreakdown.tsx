import { useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Flag,
  LoaderCircle,
  Phone,
  Mail,
} from "lucide-react";
import type { Asset } from "./types";
import {
  activeBreakdown,
  repairStatus,
  type BreakdownAction,
} from "./breakdowns";
import {
  maintenanceContactFor,
  phoneLink,
  emailLink,
} from "./maintenance-contact";
import { api } from "./api";
import { ManagedDialog } from "./DialogManager";

const pretty = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");

export function EquipmentBreakdown({
  asset,
  mode,
  onSaved,
  onClose,
  onChangeMode,
}: {
  asset: Asset;
  mode: BreakdownAction;
  onSaved: (asset: Asset) => void;
  onClose: () => void;
  onChangeMode: (mode: BreakdownAction) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const active = activeBreakdown(asset);
  const [scheduled, setScheduled] = useState(
    mode === "schedule" || Boolean(active?.scheduledDate),
  );
  const [date, setDate] = useState(active?.scheduledDate || "");
  const contact = maintenanceContactFor(asset);
  const phone = phoneLink(contact.maintenancePhone);
  const email = emailLink(contact.maintenanceEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<Asset>(`/assets/${asset.id}/breakdown`, {
        method: "PATCH",
        body: JSON.stringify(
          mode === "resolve"
            ? { action: mode }
            : { action: mode, scheduledDate: scheduled ? date : null },
        ),
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      setError((error as Error).message);
      setBusy(false);
    }
  }
  return (
    <ManagedDialog
      ref={dialog}
      closeDisabled={busy}
      onRequestClose={onClose}
      className="maintenance-assignment-dialog breakdown-dialog"
      aria-labelledby="breakdown-title"
    >
      <header className="document-header">
        <div>
          <h2 id="breakdown-title">
            {mode === "resolve"
              ? "Registrar reparo"
              : mode === "report"
                ? "Registrar quebra"
                : active?.scheduledDate
                  ? "Atualizar reparo"
                  : "Agendar reparo"}
          </h2>
          <p>
            {asset.name} · Tombamento {asset.patrimony}
          </p>
        </div>
      </header>
      <form onSubmit={submit}>
        <div className="breakdown-dialog-body">
          {mode === "resolve" ? (
            <p className="breakdown-dialog-description">
              A marcação de quebrado será encerrada e o registro ficará no
              histórico do equipamento.
            </p>
          ) : (
            <fieldset disabled={busy} className="breakdown-fields">
              <legend className="visually-hidden">
                Agendamento da manutenção
              </legend>
              <p className="breakdown-dialog-description">
                {mode === "report"
                  ? "O equipamento ficará marcado como quebrado até o reparo ser informado."
                  : "Informe a data combinada para a manutenção."}
              </p>
              <section
                className="breakdown-attendance"
                aria-label="Quem atende a manutenção"
              >
                <span>Quem atende</span>
                <strong>{contact.name}</strong>
                {(phone || email) && (
                  <div className="equipment-maintenance-contact">
                    {phone && (
                      <a href={phone}>
                        <Phone size={13} />
                        {contact.maintenancePhone}
                      </a>
                    )}
                    {email && (
                      <a href={email}>
                        <Mail size={13} />
                        {contact.maintenanceEmail}
                      </a>
                    )}
                  </div>
                )}
              </section>
              <label className="breakdown-scheduled">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(event) => setScheduled(event.target.checked)}
                />
                A manutenção já foi agendada
              </label>
              {scheduled && (
                <label className="breakdown-date">
                  Data da manutenção
                  <input
                    autoFocus
                    type="date"
                    required
                    min="1900-01-01"
                    max="2200-12-31"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
              )}
              {active && (
                <button
                  type="button"
                  className="text-button breakdown-complete-action"
                  onClick={() => onChangeMode("resolve")}
                >
                  <Check size={14} />O equipamento já foi reparado
                </button>
              )}
            </fieldset>
          )}
        </div>
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
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`button primary ${mode === "report" ? "breakdown-submit" : ""}`}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle size={14} className="spin" />
            ) : mode === "report" ? (
              <Flag size={14} />
            ) : mode === "resolve" ? (
              <Check size={14} />
            ) : (
              <CalendarDays size={14} />
            )}
            {busy
              ? "Salvando…"
              : mode === "resolve"
                ? "Confirmar reparo"
                : mode === "report"
                  ? "Registrar quebra"
                  : "Salvar agendamento"}
          </button>
        </footer>
      </form>
    </ManagedDialog>
  );
}

export function EquipmentBreakdownSummary({
  asset,
  onSchedule,
  onResolve,
  today,
}: {
  asset: Asset;
  onSchedule?: () => void;
  onResolve?: () => void;
  today: string;
}) {
  const active = activeBreakdown(asset);
  const workflow = repairStatus(asset, today);
  const history = asset.breakdowns?.filter((item) => item.resolvedAt) || [];
  if (!active && !history.length) return null;
  return (
    <section
      className={`equipment-breakdown ${active ? "is-broken" : ""}`}
      aria-label="Quebra e reparo do equipamento"
    >
      {active && (
        <>
          <div className="breakdown-heading">
            <Flag size={17} fill="currentColor" aria-hidden="true" />
            <div>
              <strong>Equipamento quebrado</strong>
              <p>{workflow?.detail}</p>
            </div>
          </div>
          <div className="breakdown-actions">
            {onSchedule && (
              <button
                type="button"
                className="button secondary"
                onClick={onSchedule}
              >
                <CalendarDays size={14} />
                {active.scheduledDate
                  ? "Alterar agendamento"
                  : "Agendar manutenção"}
              </button>
            )}
            {onResolve && (
              <button type="button" className="text-button" onClick={onResolve}>
                <Check size={14} />
                Marcar como reparado
              </button>
            )}
          </div>
        </>
      )}
      {history.length > 0 && (
        <details className="breakdown-history">
          <summary>Histórico de reparos</summary>
          {history.map((item) => (
            <article key={item.id}>
              <strong>
                Reparo informado em {pretty(item.resolvedAt!.slice(0, 10))}
              </strong>
              <small>
                Quebra registrada em {pretty(item.reportedAt.slice(0, 10))}
                {item.scheduledDate
                  ? ` · Agendado para ${pretty(item.scheduledDate)}`
                  : ""}
              </small>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
