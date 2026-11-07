import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  X,
} from "lucide-react";
import logo from "../../../brand/logo/svg/consta-wordmark-black.svg?raw";
import type { AppConfig, Asset, MaintenanceEvent } from "./types";
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
const intervalLabel = (asset: Asset) =>
  asset.periodValue
    ? `A cada ${asset.periodValue} ${asset.periodUnit === "days" ? (asset.periodValue === 1 ? "dia" : "dias") : asset.periodUnit === "years" ? (asset.periodValue === 1 ? "ano" : "anos") : asset.periodValue === 1 ? "mês" : "meses"}`
    : "Intervalo pendente";

// SVG estático versionado no repositório; inline para usar DM Mono local.
const Brand = () => (
  <span className="wordmark" dangerouslySetInnerHTML={{ __html: logo }} />
);

export function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
  );
  const [view, setView] = useState<"calendar" | "assets">(() =>
    location.hash === "#equipamentos" ? "assets" : "calendar",
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
      setView(location.hash === "#equipamentos" ? "assets" : "calendar");
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
      api<MaintenanceEvent[]>(
        `/events?from=${dateKey(days[0])}&to=${dateKey(days[41])}`,
      ),
    ])
      .then(([nextAssets, nextEvents]) => {
        if (!cancelled) {
          setAssets(nextAssets);
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
    `${asset.name} ${asset.patrimony} ${asset.model} ${asset.sector}`
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
  const pending = assets.filter((asset) => !asset.reviewed).length;
  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1, 12),
    );
    setSelection(null);
  };
  const openEvent = (event: MaintenanceEvent) =>
    setEditing(assets.find((asset) => asset.id === event.assetId));
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
    <div className="app-shell">
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
            href="#equipamentos"
            aria-current={view === "assets" ? "page" : undefined}
          >
            <LayoutGrid size={19} />
            Equipamentos<span className="nav-count">{assets.length}</span>
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
              {view === "calendar" ? "Calendário" : "Equipamentos"}
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
          <div className="page-heading">
            <div>
              <div className="eyebrow">GESTÃO DE EQUIPAMENTOS</div>
              <h1>
                {view === "calendar"
                  ? "Cada manutenção, no seu tempo."
                  : "Seu inventário, organizado."}
              </h1>
              <p>
                {view === "calendar"
                  ? "Dos contratos às próximas datas. Tudo em um só calendário."
                  : "Contratos e previsões conectados ao equipamento certo."}
              </p>
            </div>
            <button className="button primary" onClick={() => setEditing(null)}>
              <Plus size={18} />
              Novo equipamento
            </button>
          </div>
          {assets.some((asset) => asset.simulated) && (
            <div className="demo-banner">
              <span className="demo-dot" />
              <span>
                Você está explorando{" "}
                <strong>dados sintéticos de demonstração</strong>. Cadastre um
                equipamento para começar seu próprio calendário.
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
          <section className="stats" aria-label="Resumo">
            <div className="stat">
              <div>
                <span>Previsões neste mês</span>
                <strong>
                  {String(monthEvents.length).padStart(2, "0")}
                  <small>manutenções</small>
                </strong>
                <p>Conforme as regras revisadas</p>
              </div>
              <span className="stat-icon orange">
                <CalendarDays size={20} />
              </span>
            </div>
            <div className="stat">
              <div>
                <span>Equipamentos cadastrados</span>
                <strong>
                  {String(assets.length).padStart(2, "0")}
                  <small>no inventário</small>
                </strong>
                <p>Identificados pelo patrimônio</p>
              </div>
              <span className="stat-icon">
                <LayoutGrid size={20} />
              </span>
            </div>
            <div className="stat">
              <div>
                <span>Pendentes de revisão</span>
                <strong>
                  {String(pending).padStart(2, "0")}
                  <small>cadastros</small>
                </strong>
                <p>
                  {pending
                    ? "Complete os dados para gerar previsões"
                    : "Tudo conferido por aqui"}
                </p>
              </div>
              <span className="stat-icon">
                <ClipboardList size={20} />
              </span>
            </div>
          </section>
          {view === "calendar" ? (
            <section className="calendar-section">
              <div className="section-toolbar">
                <div className="section-title">
                  <h2>Calendário de manutenção</h2>
                  <span className="badge neutral">Previsões</span>
                </div>
                <label className="search">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar equipamento ou patrimônio"
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
                    <span>Datas calculadas a partir de regras conferidas</span>
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
                  <div className="agenda-tip">
                    <ArrowDownLeft size={20} />
                    <strong>Uma previsão começa no contrato.</strong>
                    <p>
                      Adicione um equipamento e confira a periodicidade. O
                      calendário cuida das próximas datas.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setEditing(null)}
                    >
                      Adicionar equipamento <ArrowRight size={14} />
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          ) : (
            <section className="inventory-section">
              <div className="section-toolbar">
                <div className="section-title">
                  <h2>Equipamentos</h2>
                  <span className="badge neutral">
                    {filteredAssets.length} cadastros
                  </span>
                </div>
                <label className="search">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar nome, patrimônio ou setor"
                    aria-label="Buscar equipamento"
                  />
                </label>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Equipamento / modelo</th>
                      <th>Patrimônio</th>
                      <th>Setor</th>
                      <th>Periodicidade</th>
                      <th>Revisão</th>
                      <th>
                        <span className="visually-hidden">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <div className="asset-name">
                            <span className="equipment-icon">
                              <LayoutGrid size={18} />
                            </span>
                            <div>
                              <button onClick={() => setEditing(asset)}>
                                {asset.name}
                              </button>
                              <small>
                                {asset.model || "Modelo não informado"}
                                {asset.simulated ? " · Simulado" : ""}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="mono">{asset.patrimony}</td>
                        <td>{asset.sector || "—"}</td>
                        <td>{intervalLabel(asset)}</td>
                        <td>
                          <span
                            className={`badge ${asset.reviewed ? "reviewed" : "warning"}`}
                          >
                            {asset.reviewed ? <Check size={12} /> : null}
                            {asset.reviewed ? "Conferido" : "Pendente"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            onClick={() => setEditing(asset)}
                            aria-label={`Editar ${asset.name}`}
                          >
                            <ChevronRight size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredAssets.length && (
                  <div className="empty-inventory">
                    <LayoutGrid size={32} />
                    <h3>
                      {query
                        ? "Nenhum equipamento encontrado"
                        : "Seu primeiro equipamento começa aqui."}
                    </h3>
                    <p>
                      {query
                        ? "Tente outro nome ou patrimônio."
                        : "Envie um contrato ou preencha o cadastro manualmente."}
                    </p>
                    <button
                      className="button primary"
                      onClick={() => setEditing(null)}
                    >
                      <Plus size={16} />
                      Novo equipamento
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>
              CONSTA<span className="orange-dot">.</span> Clareza para cuidar do
              que importa.
            </span>
            <span>
              Previsão de manutenção não equivale a liberação técnica.
            </span>
          </footer>
        </main>
      </div>
      {editing !== undefined && (
        <AssetDialog
          key={editing?.id || "new"}
          asset={editing}
          assets={assets}
          aiReady={config?.aiReady || false}
          onClose={() => setEditing(undefined)}
          onSaved={onSaved}
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
            o patrimônio do equipamento.
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
