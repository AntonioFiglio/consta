import { useRef, useState } from "react";
import { ManagedDialog } from "./DialogManager";
import { api } from "./api";
import type { Asset } from "./types";

export function CoverageDatesDialog({ asset, coverageId, onClose, onSaved, onOpenDocument }: {
  asset: Asset;
  coverageId: string;
  onClose: () => void;
  onSaved: (asset: Asset) => void;
  onOpenDocument: (id: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const plan = asset.coverages?.find((item) => item.id === coverageId) || asset;
  const [start, setStart] = useState(plan.validFrom || "");
  const [end, setEnd] = useState(plan.validUntil || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      onSaved(await api<Asset>(`/assets/${asset.id}/coverages/${encodeURIComponent(coverageId)}/dates`, {
        method: "PATCH",
        body: JSON.stringify({ validFrom: start, validUntil: end }),
      }));
    } catch (error) {
      setError((error as Error).message);
      setBusy(false);
    }
  }
  return (
    <ManagedDialog ref={dialog} className="coverage-dates-dialog" closeDisabled={busy}
      onRequestClose={onClose} aria-labelledby="coverage-dates-title"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); if (!busy) onClose(); }}>
      <header className="document-header">
        <div>
          <h2 id="coverage-dates-title">Informar datas do contrato</h2>
          <p>{asset.name} · Tombamento {asset.patrimony}</p>
        </div>
      </header>
      <form onSubmit={save}>
        <fieldset disabled={busy} className="coverage-dates-fields">
          <legend className="visually-hidden">Datas do contrato</legend>
          <div className="coverage-dates-guidance">
            <p>Precisamos dessas datas para saber se a manutenção deste equipamento está incluída no contrato hoje.</p>
            <p>Abra o contrato ou o aditivo que define o período da manutenção. Procure as cláusulas “Vigência” ou “Prazo de execução” e confira as datas de início e término do serviço.</p>
            {plan.contractId && <button type="button" className="text-button" onClick={() => onOpenDocument(plan.contractId!)}>Abrir contrato ou aditivo</button>}
            <p>Se a manutenção é feita pela Oficina do hospital, escolha “Manutenção interna” em Gerenciar manutenção.</p>
          </div>
          <label>Início do contrato
            <input type="date" required autoFocus={!plan.validFrom} min="1900-01-01" max={end || "2200-12-31"}
              value={start} onChange={(event) => setStart(event.target.value)} />
          </label>
          <label>Fim do contrato
            <input type="date" required autoFocus={Boolean(plan.validFrom)} min={start || "1900-01-01"} max="2200-12-31"
              value={end} onChange={(event) => setEnd(event.target.value)} />
          </label>
          {error && <p className="error-message" role="alert">{error}</p>}
        </fieldset>
        <footer className="document-footer">
          <button type="button" className="button secondary" disabled={busy} onClick={onClose}>Cancelar</button>
          <button className="button primary" disabled={busy}>{busy ? "Salvando…" : "Salvar datas"}</button>
        </footer>
      </form>
    </ManagedDialog>
  );
}
