import { useEffect, useRef, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
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
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [provider, setProvider] = useState<MaintenanceProvider>(() =>
    maintenanceProviderFor(asset),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
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
    <dialog
      ref={dialog}
      className="maintenance-assignment-dialog"
      aria-labelledby="assignment-title"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <header className="document-header">
        <div>
          <h2 id="assignment-title">Quem cuida da manutenção?</h2>
          <p>
            {asset.name} · Tombamento {asset.patrimony}
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          disabled={busy}
          onClick={onClose}
          aria-label="Fechar definição de manutenção"
        >
          <X size={18} />
        </button>
      </header>
      <form onSubmit={save}>
        <fieldset disabled={busy} className="maintenance-options">
          <legend className="visually-hidden">
            Responsável pela manutenção
          </legend>
          {(
            [
              [
                "contract",
                "Por contrato",
                "A cobertura depende da vigência e da conferência do contrato.",
              ],
              [
                "internal",
                "Oficina de Manutenção",
                "Manutenção realizada pela equipe interna do hospital.",
              ],
              [
                "unassigned",
                "Ainda não definido",
                "O equipamento ficará na lista de atenção.",
              ],
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value}>
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
          <button className="button primary" disabled={busy}>
            {busy && <LoaderCircle size={14} className="spin" />}
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
