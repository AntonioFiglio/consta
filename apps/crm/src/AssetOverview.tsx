import { useEffect, useRef, useId } from "react";
import { FileText, GripHorizontal, Pencil, X } from "lucide-react";
import type { RefObject } from "react";
import { useDraggablePanel } from "./useDraggablePanel";
import type { Asset } from "./types";
import { maintenanceStatus } from "./maintenance-status";
import { nextMaintenanceDate } from "./schedule";

const pretty = (date?: string | null) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
    : "Não informado";
const period = (value: number | null, unit: string) =>
  value
    ? `A cada ${value} ${unit === "days" ? (value === 1 ? "dia" : "dias") : unit === "years" ? (value === 1 ? "ano" : "anos") : value === 1 ? "mês" : "meses"}`
    : "Periodicidade pendente";

export function AssetOverview({
  asset,
  today,
  onClose,
  onEdit,
  onContract,
  floating = false,
  containerRef,
}: {
  asset: Asset;
  today: string;
  onClose: () => void;
  onEdit?: () => void;
  floating?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
  onContract: (id: string) => void;
}) {
  const panel = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const { handleProps, style } = useDraggablePanel(panel, containerRef);
  const Surface = floating ? "div" : "dialog";
  useEffect(() => {
    if (!floating && panel.current instanceof HTMLDialogElement)
      panel.current.showModal();
    if (floating) closeButton.current?.focus({ preventScroll: true });
  }, [floating]);
  const responsibility = maintenanceStatus(asset, today);
  const next = nextMaintenanceDate(asset, today);
  const plans = asset.coverages || [];
  return (
    <Surface
      ref={(element: HTMLDivElement | HTMLDialogElement | null) => {
        panel.current = element;
      }}
      className={`asset-overview-dialog ${floating ? "asset-overview-floating" : ""}`}
      role="dialog"
      aria-modal={!floating}
      aria-labelledby={titleId}
      style={style}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onClick={(event) => {
        if (!floating && event.target === panel.current) onClose();
      }}
    >
      <header className="document-header">
        <div
          className="floating-drag-handle overview-drag-handle"
          {...handleProps}
        >
          <GripHorizontal size={16} className="drag-grip" />
          <div>
            <span className="eyebrow">
              EQUIPAMENTO{asset.simulated ? " · SIMULADO" : ""}
            </span>
            <h2 id={titleId}>{asset.name}</h2>
            <p>
              Número de tombamento{" "}
              <span className="mono">{asset.patrimony}</span>
            </p>
          </div>
        </div>
        <button
          ref={closeButton}
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar ficha do equipamento"
        >
          <X size={20} />
        </button>
      </header>
      <div className="asset-overview-body">
        <section>
          <h3>Identificação</h3>
          <dl className="asset-facts">
            <div>
              <dt>Modelo</dt>
              <dd>{asset.model || "Não informado"}</dd>
            </div>
            <div>
              <dt>Número de série</dt>
              <dd className="mono">{asset.serial || "Não informado"}</dd>
            </div>
            <div>
              <dt>Setor</dt>
              <dd>{asset.sector || "Não informado"}</dd>
            </div>
            <div>
              <dt>Revisão do plano</dt>
              <dd>
                <span
                  className={`badge ${asset.reviewed ? "reviewed" : "warning"}`}
                >
                  {asset.reviewed ? "Conferido" : "Pendente"}
                </span>
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>Manutenção</h3>
          <div className="overview-maintenance-status">
            <span className={`maintenance-status ${responsibility.group}`}>
              <i />
              {responsibility.label}
            </span>
            <p>{responsibility.detail}</p>
          </div>
          <dl className="asset-facts">
            <div>
              <dt>Periodicidade do último plano</dt>
              <dd>{period(asset.periodValue, asset.periodUnit)}</dd>
            </div>
            <div>
              <dt>Próxima manutenção prevista</dt>
              <dd>{next ? pretty(next) : "Sem previsão"}</dd>
            </div>
            <div>
              <dt>Primeira manutenção do plano</dt>
              <dd>{pretty(asset.firstDueDate)}</dd>
            </div>
            <div>
              <dt>Cobertura do último contrato</dt>
              <dd>
                {pretty(asset.validFrom)} · {pretty(asset.validUntil)}
              </dd>
            </div>
          </dl>
        </section>
        {asset.notes && (
          <section>
            <h3>Observações</h3>
            <p className="asset-notes">{asset.notes}</p>
          </section>
        )}
        <section>
          <h3>
            Contratos e coberturas{" "}
            <span className="badge neutral">
              {plans.filter((plan) => plan.contractId).length ||
                (asset.contractId ? 1 : 0)}
            </span>
          </h3>
          {plans.length ? (
            <div className="asset-contract-history">
              {[...plans].reverse().map((plan) => (
                <article key={plan.id}>
                  <div className="asset-coverage-title">
                    {plan.contractId ? (
                      <button
                        className="text-button"
                        onClick={() => onContract(plan.contractId!)}
                      >
                        <FileText size={15} />
                        {plan.contractName || "Ver contrato"}
                      </button>
                    ) : (
                      <strong>Cadastro manual</strong>
                    )}
                    <span
                      className={`badge ${plan.reviewed ? "neutral" : "warning"}`}
                    >
                      {plan.reviewed ? "Conferido" : "Pendente"}
                    </span>
                  </div>
                  <p>
                    De {pretty(plan.validFrom)} até {pretty(plan.validUntil)}
                  </p>
                  <small>
                    {period(plan.periodValue, plan.periodUnit)} · Primeira
                    manutenção: {pretty(plan.firstDueDate)}
                  </small>
                </article>
              ))}
            </div>
          ) : asset.contractId ? (
            <button
              className="text-button"
              onClick={() => onContract(asset.contractId!)}
            >
              <FileText size={15} />
              {asset.contractName || "Ver contrato"}
            </button>
          ) : (
            <p className="field-hint">
              Nenhum contrato vinculado a este equipamento.
            </p>
          )}
        </section>
      </div>
      <footer className="document-footer">
        <span>Previsão não equivale a liberação técnica.</span>
        {onEdit ? (
          <button className="button secondary" onClick={onEdit}>
            <Pencil size={14} /> Editar equipamento
          </button>
        ) : (
          <button className="button secondary" onClick={onClose}>
            Fechar ficha
          </button>
        )}
      </footer>
    </Surface>
  );
}
