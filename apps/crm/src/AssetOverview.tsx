import { equipmentTombamentoLabel } from "./equipment-import";
import { contractCopy } from "./contract-copy";
import { ManagedDialog } from "./DialogManager";
import { useEffect, useRef, useId, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Flag,
  Pencil,
  Phone,
  Mail,
} from "lucide-react";
import type { RefObject } from "react";
import type { Asset } from "./types";
import { nextMaintenanceDate } from "./schedule";
import { brandAndModel } from "./equipment-identity";
import {
  maintenanceContactFor,
  phoneLink,
  emailLink,
} from "./maintenance-contact";
import { activeBreakdown, type OnBreakdown } from "./breakdowns";
import { EquipmentBreakdownSummary } from "./EquipmentBreakdown";

const pretty = (date?: string | null) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
    : "Não informado";
const period = (value: number | null, unit: string) =>
  value
    ? `A cada ${value} ${unit === "days" ? (value === 1 ? "dia" : "dias") : unit === "years" ? (value === 1 ? "ano" : "anos") : value === 1 ? "mês" : "meses"}`
    : "Intervalo não informado";
const tabs = [
  { id: "summary", label: "Visão geral" },
  { id: "documents", label: contractCopy.area },
  { id: "details", label: "Cadastro" },
] as const;
type Tab = (typeof tabs)[number]["id"];

export function AssetOverview({
  asset,
  today,
  onClose,
  onEdit,
  onBreakdown,
  onContract,
  floating = false,
}: {
  asset: Asset;
  today: string;
  onClose: () => void;
  onEdit?: () => void;
  onBreakdown?: OnBreakdown;
  floating?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
  onContract: (id: string) => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const [tab, setTab] = useState<Tab>("summary");
  useEffect(() => {
    setTab("summary");
  }, [asset.id]);
  useEffect(() => {
    if (floating) closeButton.current?.focus({ preventScroll: true });
  }, [floating]);
  const broken = activeBreakdown(asset);
  const contact = maintenanceContactFor(asset);
  const phone = phoneLink(contact.maintenancePhone);
  const email = emailLink(contact.maintenanceEmail);
  const next = nextMaintenanceDate(asset, today);
  const plans = asset.coverages || [];
  const documentIds = [
    ...new Set(
      [
        ...[...plans].reverse().map((plan) => plan.contractId),
        asset.contractId,
        ...(asset.maintenanceDocuments || []).map(
          (record) => record.contractId,
        ),
      ].filter((value): value is string => Boolean(value)),
    ),
  ];

  return (
    <ManagedDialog
      closeButtonRef={closeButton}
      onRequestClose={onClose}
      className="asset-overview-dialog equipment-sheet"
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <header className="equipment-sheet-header">
        <div className="equipment-sheet-kicker">Ficha do equipamento</div>
        <h2 id={`${id}-title`}>{asset.name}</h2>
        <div className="equipment-sheet-identity">
          <span className="mono">Tombamento {equipmentTombamentoLabel(asset)}</span>
          <span>{asset.sector || "Setor não informado"}</span>
        </div>
        {brandAndModel(asset) && <p>{brandAndModel(asset)}</p>}
      </header>
      <div
        className="equipment-sheet-tabs"
        role="tablist"
        aria-label="Informações do equipamento"
      >
        {tabs.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            ref={(element) => {
              tabButtons.current[index] = element;
            }}
            id={`${id}-tab-${item.id}`}
            aria-controls={`${id}-panel-${item.id}`}
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              let target = index;
              if (event.key === "ArrowRight")
                target = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft")
                target = (index + tabs.length - 1) % tabs.length;
              else if (event.key === "Home") target = 0;
              else if (event.key === "End") target = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[target].id);
              tabButtons.current[target]?.focus();
            }}
          >
            {item.label}
            {item.id === "documents" && <span>{documentIds.length}</span>}
          </button>
        ))}
      </div>
      <div className="equipment-sheet-content">
        <div
          role="tabpanel"
          id={`${id}-panel-summary`}
          aria-labelledby={`${id}-tab-summary`}
          hidden={tab !== "summary"}
          tabIndex={0}
        >
          <EquipmentBreakdownSummary
            today={today}
            asset={asset}
            onSchedule={
              onBreakdown ? () => onBreakdown(asset, "schedule") : undefined
            }
            onResolve={
              onBreakdown ? () => onBreakdown(asset, "resolve") : undefined
            }
          />
          <div className="equipment-sheet-summary">
            <div className="equipment-sheet-metric">
              <span>Quem atende</span>
              <strong>{contact.name}</strong>
              {(phone || email) && (
                <div className="equipment-maintenance-contact">
                  {phone && (
                    <a href={phone}>
                      <Phone size={13} aria-hidden="true" />
                      {contact.maintenancePhone}
                    </a>
                  )}
                  {email && (
                    <a href={email}>
                      <Mail size={13} aria-hidden="true" />
                      {contact.maintenanceEmail}
                    </a>
                  )}
                </div>
              )}
              {contact.contractId ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onContract(contact.contractId!)}
                >
                  Ver documento da manutenção <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setTab("documents")}
                >
                  {documentIds.length
                    ? "Ver arquivos"
                    : "Sem arquivos vinculados"}
                </button>
              )}
            </div>
            <div className="equipment-sheet-metric">
              <span>
                <CalendarDays size={14} aria-hidden="true" /> Próxima manutenção
                prevista
              </span>
              <strong className="equipment-sheet-date">
                {next ? pretty(next) : "Sem data prevista"}
              </strong>
              <small>Previsão do plano de manutenção</small>
            </div>
          </div>
          {!next && onEdit && (
            <button
              type="button"
              className="text-button equipment-sheet-plan-action"
              onClick={onEdit}
            >
              Definir próxima manutenção <ArrowRight size={14} />
            </button>
          )}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel-documents`}
          aria-labelledby={`${id}-tab-documents`}
          hidden={tab !== "documents"}
          tabIndex={0}
        >
          {documentIds.length ? (
            <div className="equipment-sheet-documents">
              {documentIds.map((contractId) => {
                const records =
                  asset.maintenanceDocuments?.filter(
                    (record) => record.contractId === contractId,
                  ) || [];
                const coverages = plans.length
                  ? plans.filter((plan) => plan.contractId === contractId)
                  : asset.contractId === contractId
                    ? [{ ...asset, id: `current:${asset.id}` }]
                    : [];
                const record = records[0];
                const name =
                  record?.name ||
                  coverages[0]?.contractName ||
                  (contractId === asset.contractId
                    ? asset.contractName
                    : null) ||
                  "Documento contratual";
                return (
                  <article key={contractId}>
                    <div className="equipment-sheet-document-heading">
                      <FileText size={19} aria-hidden="true" />
                      <div>
                        <button
                          type="button"
                          className="contract-document-name"
                          onClick={() => onContract(contractId)}
                        >
                          {name}
                        </button>
                        <small>
                          {record?.kind === "amendment"
                            ? contractCopy.amendment
                            : record?.kind === "complement"
                              ? contractCopy.annex
                              : record?.kind === "outsourced"
                                ? contractCopy.maintenance
                                : contractCopy.principal}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => onContract(contractId)}
                      >
                        Abrir <ArrowRight size={14} />
                      </button>
                    </div>
                    {coverages.map((plan) => (
                      <div
                        key={plan.id}
                        className="equipment-sheet-document-period"
                      >
                        <span>
                          {pretty(plan.validFrom)} → {pretty(plan.validUntil)}
                        </span>
                        <span>
                          {plan.reviewed
                            ? "Dados conferidos"
                            : "Dados a conferir"}
                        </span>
                        <small>
                          {period(plan.periodValue, plan.periodUnit)} · Primeira
                          manutenção: {pretty(plan.firstDueDate)}
                        </small>
                      </div>
                    ))}
                    {records.map((item) => (
                      <div
                        key={item.id}
                        className="equipment-sheet-document-note"
                      >
                        <small>
                          Adicionado em{" "}
                          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                        </small>
                        {item.notes && <p>{item.notes}</p>}
                      </div>
                    ))}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="equipment-sheet-empty">
              <FileText size={26} aria-hidden="true" />
              <strong>Nenhum arquivo vinculado</strong>
            </div>
          )}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel-details`}
          aria-labelledby={`${id}-tab-details`}
          hidden={tab !== "details"}
          tabIndex={0}
        >
          <dl className="asset-facts equipment-sheet-facts">
            <div>
              <dt>Marca</dt>
              <dd>{asset.brand || "Não informada"}</dd>
            </div>
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
              <dt>Conferência do plano</dt>
              <dd>
                {asset.reviewed ? "Dados conferidos" : "Dados a conferir"}
              </dd>
            </div>
            <div>
              <dt>Intervalo do último plano</dt>
              <dd>{period(asset.periodValue, asset.periodUnit)}</dd>
            </div>
            <div>
              <dt>Primeira manutenção</dt>
              <dd>{pretty(asset.firstDueDate)}</dd>
            </div>
            <div>
              <dt>Referência do plano</dt>
              <dd>
                {asset.anchorType || "Não informada"}{" "}
                {asset.anchorDate ? `· ${pretty(asset.anchorDate)}` : ""}
              </dd>
            </div>
          </dl>
          {asset.notes && (
            <div className="equipment-sheet-notes">
              <h3>Observações</h3>
              <p className="asset-notes">{asset.notes}</p>
            </div>
          )}
        </div>
      </div>
      <footer className="document-footer equipment-sheet-footer">
        <span>Datas previstas não comprovam manutenção realizada.</span>
        <div className="equipment-sheet-footer-actions">
          {!broken && onBreakdown && (
            <button
              type="button"
              className="button secondary report-breakdown"
              onClick={() => onBreakdown(asset, "report")}
            >
              <Flag size={14} />
              Registrar quebra
            </button>
          )}
          {onEdit && (
            <button type="button" className="text-button" onClick={onEdit}>
              <Pencil size={14} /> Editar cadastro
            </button>
          )}
        </div>
      </footer>
    </ManagedDialog>
  );
}
