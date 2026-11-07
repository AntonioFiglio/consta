import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  X,
} from "lucide-react";
import logo from "../../../brand/logo/svg/consta-wordmark-black.svg?raw";
import type {
  AppConfig,
  Asset,
  MaintenanceEvent,
  ContractSummary,
} from "./types";
import { ContractsPage } from "./ContractsPage";
import { ContractViewer } from "./ContractViewer";
import { AssetOverview } from "./AssetOverview";
import { EquipmentPage } from "./EquipmentPage";
import { MaintenanceAssignment } from "./MaintenanceAssignment";
import { AssetDialog } from "./AssetDialog";
import { api } from "./api";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (date: string) => new Date(`${date}T12:00:00`);
const prettyDate = (date: string) =>
  fromKey(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const monthName = (date: Date) =>
  date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
// SVG estático versionado no repositório; inline para usar DM Mono local.
const Brand = () => (
  <span className="wordmark" dangerouslySetInnerHTML={{ __html: logo }} />
);

export function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [viewingContract, setViewingContract] = useState<string | null>(null);
  const [assigningMaintenance, setAssigningMaintenance] =
    useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
  );
  const [view, setView] = useState<"calendar" | "assets" | "contracts">(() =>
    location.hash === "#contratos"
      ? "contracts"
      : location.hash === "#equipamentos"
        ? "assets"
        : "calendar",
  );
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<string | null>(null);
  const [editing, setEditing] = useState<Asset | null | undefined>(undefined);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const today = dateKey(new Date());
  const days = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - ((start.getDay() + 6) % 7));
    return Array.from(
      { length: 42 },
      (_, i) =>
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + i,
          12,
        ),
    );
  }, [month]);
  const refreshConfig = useCallback(
    () =>
      api<AppConfig>("/config")
        .then(setConfig)
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        }),
    [],
  );
  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);
  useEffect(() => {
    const changed = () => {
      setView(
        location.hash === "#contratos"
          ? "contracts"
          : location.hash === "#equipamentos"
            ? "assets"
            : "calendar",
      );
      setQuery("");
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    if (!config?.authenticated) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      api<Asset[]>("/assets"),
      api<ContractSummary[]>("/contracts"),
      api<MaintenanceEvent[]>(
        `/events?from=${dateKey(days[0])}&to=${dateKey(days[41])}`,
      ),
    ])
      .then(([nextAssets, nextContracts, nextEvents]) => {
        if (!cancelled) {
          setAssets(nextAssets);
          setContracts(nextContracts);
          setEvents(nextEvents);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config, days, revision]);
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timeout);
    }
  }, [toast]);
  const filteredAssets = assets.filter((asset) =>
    `${asset.name} ${asset.patrimony} ${asset.serial} ${asset.model} ${asset.sector} ${asset.contractName || ""}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const visibleIds = new Set(filteredAssets.map((asset) => asset.id));
  const filteredEvents = events.filter((event) =>
    visibleIds.has(event.assetId),
  );
  const monthEvents = filteredEvents.filter(
    (event) => event.date.slice(0, 7) === dateKey(month).slice(0, 7),
  );
  const agenda = selection
    ? filteredEvents.filter((event) => event.date === selection)
    : monthEvents;
  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1, 12),
    );
    setSelection(null);
  };
  const openEvent = (event: MaintenanceEvent) =>
    setViewingAsset(assets.find((asset) => asset.id === event.assetId) || null);
  const onSaved = () => {
    setEditing(undefined);
    setRevision((value) => value + 1);
    setToast("Cadastro salvo. O calendário já está atualizado.");
  };
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    try {
      await api("/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setPassword("");
      await refreshConfig();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoginBusy(false);
    }
  }
  if (config && !config.authenticated)
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={login}>
          <Brand />
          <div className="eyebrow">GESTÃO DE EQUIPAMENTOS</div>
          <h1>Bom ter você por aqui.</h1>
          <p>Acesse os contratos e o calendário de manutenção.</p>
          <label>
            Senha de acesso
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button className="button primary" disabled={loginBusy}>
            {loginBusy ? "Entrando…" : "Acessar o Consta"}
            <ArrowRight size={16} />
          </button>
        </form>
      </main>
    );

  return (
    <div className={`app-shell ${view === "calendar" ? "calendar-page" : ""}`}>
      <aside className="sidebar">
        <a
          href="#calendario"
          className="brand-link"
          aria-label="CONSTA. — início"
        >
          <Brand />
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Plus size={19} strokeWidth={1.7} />
          </span>
          <div>
            <strong>Engenharia clínica</strong>
            <span>Espaço de trabalho local</span>
          </div>
        </div>
        <div className="nav-label">ESPAÇO DE TRABALHO</div>
        <nav aria-label="Navegação principal">
          <a
            href="#calendario"
            aria-current={view === "calendar" ? "page" : undefined}
          >
            <CalendarDays size={19} />
            Calendário<span className="nav-count">{monthEvents.length}</span>
          </a>
          <a
            href="#contratos"
            aria-current={view === "contracts" ? "page" : undefined}
          >
            <FileText size={19} />
            Contratos<span className="nav-count">{contracts.length}</span>
          </a>
          <a
            href="#equipamentos"
            aria-current={view === "assets" ? "page" : undefined}
          >
            <LayoutGrid size={19} />
            Equipamentos
          </a>
        </nav>
        <div className="sidebar-note">
          <div className="note-icon">
            <FileText size={19} />
          </div>
          <strong>Do contrato à próxima manutenção.</strong>
          <p>Cadastre uma vez. Tenha as datas sempre à vista.</p>
          <button type="button" onClick={() => setEditing(null)}>
            Cadastrar equipamento <ArrowRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setHelp(true)}>
            <CircleHelp size={17} />
            Como funciona
          </button>
          {config?.passwordRequired && (
            <button
              onClick={async () => {
                await api("/logout", { method: "POST" });
                refreshConfig();
              }}
            >
              <LogOut size={16} />
              Sair
            </button>
          )}
          <span className="version">CONSTA. / FASE 01</span>
        </div>
      </aside>
      <div className="main-wrapper">
        <header className="topbar">
          <div className="breadcrumb">
            Espaço de trabalho <span>/</span>
            <strong>
              {view === "calendar"
                ? "Calendário"
                : view === "contracts"
                  ? "Contratos"
                  : "Equipamentos"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="local-status">
              <i />
              {config?.mode === "local-protected"
                ? "Ambiente local"
                : "Demonstração local"}
            </span>
            <div className="avatar" title="Engenharia clínica">
              EC
            </div>
          </div>
        </header>
        <main className="main-content">
          {view !== "calendar" && (
            <div className="page-heading">
              <div>
                {view !== "assets" && (
                  <div className="eyebrow">GESTÃO DE EQUIPAMENTOS</div>
                )}
                <h1>
                  {view === "contracts"
                    ? "Seus contratos, sempre à mão."
                    : "Equipamentos"}
                </h1>
                <p>
                  {view === "contracts"
                    ? "Consulte o documento original e os equipamentos de cada contrato."
                    : "Veja quem cuida da manutenção e o que precisa de atenção."}
                </p>
              </div>
              <button
                className="button primary"
                onClick={() => setEditing(null)}
              >
                <Plus size={18} />
                Novo equipamento
              </button>
            </div>
          )}
          {assets.some((asset) => asset.simulated) && (
            <div className="demo-banner">
              <span className="demo-dot" />
              <span>
                {view === "calendar" ? (
                  <strong>Dados sintéticos de demonstração</strong>
                ) : (
                  <>
                    Você está explorando{" "}
                    <strong>dados sintéticos de demonstração</strong>. Cadastre
                    um equipamento para começar seu próprio calendário.
                  </>
                )}
              </span>
            </div>
          )}
          {error && (
            <div className="error-message" role="alert">
              {error}
              <button
                className="text-button"
                onClick={() => {
                  refreshConfig();
                  setRevision((value) => value + 1);
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {view === "calendar" ? (
            <section className="calendar-section">
              <div className="section-toolbar">
                <label className="search">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar equipamento ou número de tombamento"
                    aria-label="Buscar no calendário"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Limpar busca"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>
              <div className="calendar-layout">
                <div className="calendar-card">
                  <div className="month-toolbar">
                    <div className="month-navigation">
                      <h3>{monthName(month)}</h3>
                      <button
                        className="icon-button"
                        aria-label="Mês anterior"
                        onClick={() => changeMonth(-1)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Próximo mês"
                        onClick={() => changeMonth(1)}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        className="today-button"
                        onClick={() => {
                          setMonth(
                            new Date(
                              new Date().getFullYear(),
                              new Date().getMonth(),
                              1,
                              12,
                            ),
                          );
                          setSelection(today);
                        }}
                      >
                        Hoje
                      </button>
                    </div>
                    <span className="calendar-view">
                      <CalendarDays size={13} />
                      Mensal
                    </span>
                  </div>
                  <div className="weekdays">
                    {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map(
                      (day) => (
                        <span key={day}>{day}</span>
                      ),
                    )}
                  </div>
                  <div
                    className={`calendar-grid ${loading ? "loading" : ""}`}
                    aria-label={`Calendário de ${monthName(month)}`}
                  >
                    {days.map((day) => {
                      const key = dateKey(day);
                      const dayEvents = filteredEvents.filter(
                        (event) => event.date === key,
                      );
                      const outside = day.getMonth() !== month.getMonth();
                      return (
                        <div
                          key={key}
                          className={`calendar-cell ${outside ? "outside" : ""} ${key === today ? "is-today" : ""} ${key === selection ? "selected" : ""}`}
                        >
                          <button
                            className="day-number"
                            aria-label={`Ver previsões de ${prettyDate(key)}`}
                            onClick={() => setSelection(key)}
                            aria-pressed={key === selection}
                          >
                            {day.getDate()}
                          </button>
                          <div className="cell-events">
                            {dayEvents.slice(0, 2).map((event) => (
                              <button
                                key={event.id}
                                className="calendar-event"
                                title={`${event.name} · ${event.patrimony}${event.simulated ? " · Simulado" : ""}`}
                                onClick={() => openEvent(event)}
                              >
                                <i />
                                <span>{event.name}</span>
                                <small>{event.patrimony}</small>
                              </button>
                            ))}
                            {dayEvents.length > 2 && (
                              <button
                                className="more-events"
                                onClick={() => setSelection(key)}
                              >
                                +{dayEvents.length - 2} previsões
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <footer className="calendar-footer">
                    <span>
                      <i className="legend-dot" />
                      Manutenção prevista
                    </span>
                    <span>Previsão não equivale a liberação técnica</span>
                  </footer>
                </div>
                <aside className="agenda">
                  <div className="agenda-heading">
                    <div className="eyebrow">SUA AGENDA</div>
                    <h3>{selection ? prettyDate(selection) : "Neste mês"}</h3>
                    <p>
                      {selection
                        ? "Previsões para o dia selecionado"
                        : `${monthEvents.length} ${monthEvents.length === 1 ? "previsão para acompanhar" : "previsões para acompanhar"}`}
                    </p>
                    {selection && (
                      <button
                        className="text-button"
                        onClick={() => setSelection(null)}
                      >
                        Ver todo o mês <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                  <div className="agenda-events">
                    {loading ? (
                      <div className="empty-agenda">
                        <LoaderCircle className="spin" size={23} />
                        <span>Carregando calendário…</span>
                      </div>
                    ) : agenda.length ? (
                      agenda.map((event) => (
                        <button
                          className="agenda-event"
                          key={event.id}
                          onClick={() => openEvent(event)}
                        >
                          <div className="agenda-date">
                            <span>
                              {fromKey(event.date)
                                .toLocaleDateString("pt-BR", { month: "short" })
                                .replace(".", "")}
                            </span>
                            <strong>{event.date.slice(-2)}</strong>
                          </div>
                          <div className="agenda-description">
                            <span className="event-type">
                              <i />
                              PREVENTIVA PREVISTA
                            </span>
                            <strong>{event.name}</strong>
                            <span className="mono">{event.patrimony}</span>
                            <small>
                              {event.sector || "Setor não informado"}
                              {event.simulated ? " · Simulado" : ""}
                            </small>
                          </div>
                          <ChevronRight size={14} />
                        </button>
                      ))
                    ) : (
                      <div className="empty-agenda">
                        <CalendarDays size={27} />
                        <strong>Nenhuma previsão por aqui</strong>
                        <span>
                          {selection
                            ? "Escolha outro dia ou veja todo o mês."
                            : "Cadastre e revise um equipamento para ver as próximas datas."}
                        </span>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </section>
          ) : view === "contracts" ? (
            <ContractsPage
              contracts={contracts}
              assets={assets}
              query={query}
              onQuery={setQuery}
              onOpen={setViewingContract}
            />
          ) : (
            <EquipmentPage
              assets={filteredAssets}
              query={query}
              onQuery={setQuery}
              today={today}
              onView={setViewingAsset}
              onContract={setViewingContract}
              onAssign={setAssigningMaintenance}
              onCreate={() => setEditing(null)}
            />
          )}
          {view !== "calendar" && (
            <footer className="page-footer">
              <span>
                CONSTA<span className="orange-dot">.</span> Clareza para cuidar
                do que importa.
              </span>
              <span>
                Previsão de manutenção não equivale a liberação técnica.
              </span>
            </footer>
          )}
        </main>
      </div>
      {editing !== undefined && (
        <AssetDialog
          key={editing?.id || "new"}
          asset={editing}
          assets={assets}
          aiReady={config?.aiReady || false}
          onClose={() => {
            setEditing(undefined);
            setRevision((value) => value + 1);
          }}
          onSaved={onSaved}
        />
      )}
      {viewingAsset && (
        <AssetOverview
          asset={viewingAsset}
          today={today}
          onClose={() => setViewingAsset(null)}
          onEdit={() => {
            setEditing(viewingAsset);
            setViewingAsset(null);
          }}
          onContract={setViewingContract}
        />
      )}
      {viewingContract && (
        <ContractViewer
          contractId={viewingContract}
          assets={assets}
          onClose={() => setViewingContract(null)}
          onEditAsset={(asset) => {
            setViewingContract(null);
            setViewingAsset(null);
            setEditing(asset);
          }}
          onContract={setViewingContract}
        />
      )}
      {assigningMaintenance && (
        <MaintenanceAssignment
          key={assigningMaintenance.id}
          asset={assigningMaintenance}
          onClose={() => setAssigningMaintenance(null)}
          onSaved={(updated) => {
            setAssets((current) =>
              current.map((asset) =>
                asset.id === updated.id ? updated : asset,
              ),
            );
            setViewingAsset((current) =>
              current?.id === updated.id ? updated : current,
            );
            setAssigningMaintenance(null);
            setToast("Responsável pela manutenção atualizado.");
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Fechar aviso">
            <X size={15} />
          </button>
        </div>
      )}
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="help-dialog"
      aria-labelledby="help-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <section className="help-card">
        <button
          autoFocus
          className="icon-button help-close"
          onClick={onClose}
          aria-label="Fechar ajuda"
        >
          <X size={18} />
        </button>
        <span className="eyebrow">UM FLUXO SIMPLES</span>
        <h2 id="help-title">Do contrato ao calendário.</h2>
        <ol>
          <li>
            <strong>Envie um contrato.</strong> Arraste um PDF ou TXT e informe
            o número de tombamento do equipamento.
          </li>
          <li>
            <strong>Confira as informações.</strong> Revise a periodicidade e o
            marco inicial. A leitura automática, quando disponível, sugere dados
            com evidências.
          </li>
          <li>
            <strong>Veja as próximas datas.</strong> Confirme a revisão e salve.
            O calendário projeta os ciclos pela regra informada.
          </li>
        </ol>
        <p>
          Sem os dados necessários, o cadastro fica pendente. A leitura
          automática não prevê falhas e não libera tecnicamente um equipamento.
        </p>
        <button className="button primary" onClick={onClose}>
          Entendi <Check size={16} />
        </button>
      </section>
    </dialog>
  );
}
