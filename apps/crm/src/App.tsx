import { ContextHelp } from "./ContextHelp";
import { contractCopy, crmPageCopy } from "./contract-copy";
import { DayScheduleDialog } from "./DayScheduleDialog";
import { useSidebarResize } from "./useSidebarResize";
import { createPortal } from "react-dom";
import { EquipmentBreakdown } from "./EquipmentBreakdown";
import {
  activeBreakdown,
  syncRepairEvent,
  type BreakdownAction,
  type OnBreakdown,
} from "./breakdowns";
import { ManagedDialog } from "./DialogManager";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import {
  captureTokenFromPath,
  legacyDestination,
  pageForPath,
  routePaths,
} from "./routes";
import { CapturePage } from "./CapturePage";
import {
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  CalendarDays,
  Check,
  CircleHelp,
  FileText,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Plus,
  Upload,
  X,
} from "lucide-react";
import logo from "../../../brand/logo/svg/consta-wordmark-black.svg?raw";
import type {
  AppConfig,
  Asset,
  MaintenanceEvent,
  ContractSummary,
} from "./types";
import { ContractViewer } from "./ContractViewer";
import { AssetOverview } from "./AssetOverview";
import { CoverageDatesDialog } from "./CoverageDatesDialog";
import { MaintenanceAssignment } from "./MaintenanceAssignment";
import { AssetDialog } from "./AssetDialog";
import { api } from "./api";

const ContractsPage = lazy(() =>
  import("./ContractsPage").then((module) => ({
    default: module.ContractsPage,
  })),
);
const EquipmentPage = lazy(() =>
  import("./EquipmentPage").then((module) => ({
    default: module.EquipmentPage,
  })),
);
const CalendarPage = lazy(() =>
  import("./CalendarPage").then((module) => ({ default: module.CalendarPage })),
);

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (date: string) => new Date(`${date}T12:00:00`);
// SVG estático versionado no repositório; inline para usar DM Mono local.
const Brand = () => (
  <span className="wordmark" dangerouslySetInnerHTML={{ __html: logo }} />
);

export function App() {
  const location = useLocation();
  const captureToken = captureTokenFromPath(location.pathname);
  const navigate = useNavigate();
  const view = pageForPath(location.pathname);
  const pageTitle = useRef<HTMLHeadingElement>(null);
  const sidebar = useSidebarResize();
  const [equipmentInitialFilter, setEquipmentInitialFilter] = useState<
    "all" | "broken"
  >("all");
  const [equipmentListRevision, setEquipmentListRevision] = useState(0);

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [viewingContract, setViewingContract] = useState<string | null>(null);
  const [assigningMaintenance, setAssigningMaintenance] =
    useState<Asset | null>(null);
  const [repairTarget, setRepairTarget] = useState<{
    assetId: string;
    action: BreakdownAction;
  } | null>(null);
  const [toastCalendar, setToastCalendar] = useState<{
    date: string;
    message: string;
  } | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
  );
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<string | null>(null);
  const [viewingDay, setViewingDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<Asset | null | undefined>(undefined);
  const [editingCoverage, setEditingCoverage] = useState<{
    asset: Asset;
    coverageId: string;
  } | null>(null);
  const [contractInitialView, setContractInitialView] = useState<
    "summary" | "document" | "assets"
  >("summary");
  const openContract = (
    id: string,
    initialView: "summary" | "document" | "assets" = "summary",
  ) => {
    setContractInitialView(initialView);
    setViewingContract(id);
  };
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
    if (captureToken) return;
    setQuery("");
    document.title = `${crmPageCopy[view].title} · CONSTA.`;
    pageTitle.current?.focus({ preventScroll: true });
  }, [location.pathname, config?.authenticated, captureToken, view]);
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
      const timeout = setTimeout(
        () => setToast(""),
        toastCalendar?.message === toast ? 9000 : 4500,
      );
      return () => clearTimeout(timeout);
    }
  }, [toast, toastCalendar]);
  const filteredAssets = assets.filter((asset) =>
    `${asset.name} ${asset.patrimony} ${asset.serial} ${asset.brand} ${asset.model} ${asset.sector} ${asset.contractName || ""}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const visibleIds = new Set(
    assets
      .filter((asset) =>
        `${asset.name} ${asset.patrimony} ${asset.serial} ${asset.brand} ${asset.model} ${asset.sector} ${asset.contractName || ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")),
      )
      .map((asset) => asset.id),
  );
  const filteredEvents = events.filter((event) =>
    visibleIds.has(event.assetId),
  );
  const openBreakdown: OnBreakdown = (asset, action) => {
    const current = assets.find((item) => item.id === asset.id) || asset;
    setRepairTarget({
      assetId: current.id,
      action:
        action === "report" && activeBreakdown(current) ? "schedule" : action,
    });
  };
  const assetUpdated = (updated: Asset) => {
    setAssets((current) =>
      current.map((asset) => (asset.id === updated.id ? updated : asset)),
    );
    setEvents((current) =>
      syncRepairEvent(current, updated, dateKey(days[0]), dateKey(days[41])),
    );
    setRevision((value) => value + 1);
    const repair = activeBreakdown(updated);
    const message =
      repairTarget?.action === "resolve"
        ? "Reparo registrado. Situação do equipamento atualizada."
        : repair?.scheduledDate
          ? "Reparo agendado. Equipamento e calendário atualizados."
          : "Quebra registrada. Equipamento aguardando agendamento.";
    setToast(message);
    setToastCalendar(
      repair?.scheduledDate ? { date: repair.scheduledDate, message } : null,
    );
  };
  const showRepairOnCalendar = (date: string) => {
    setViewingAsset(null);
    setViewingContract(null);
    setRepairTarget(null);
    setQuery("");
    setMonth(
      new Date(fromKey(date).getFullYear(), fromKey(date).getMonth(), 1, 12),
    );
    setSelection(date);
    navigate(routePaths.calendar);
    setToast("");
  };
  const pendingRepairCount = assets.filter((asset) =>
    activeBreakdown(asset),
  ).length;
  const repairAsset = repairTarget
    ? assets.find((asset) => asset.id === repairTarget.assetId)
    : null;
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
  if (captureToken) return <CapturePage token={captureToken} />;

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
    <div
      className={`app-shell navigation-shell ${view === "calendar" ? "calendar-page" : ""}`}
      style={{ gridTemplateColumns: `${sidebar.width}px minmax(0, 1fr)` }}
      data-sidebar-open={sidebar.width > 0}
      data-resizing={sidebar.resizing}
    >
      {sidebar.width > 0 && (
        <button
          type="button"
          className="sidebar-mobile-backdrop"
          aria-label="Fechar menu"
          onClick={sidebar.close}
        />
      )}
      <aside
        className="sidebar application-sidebar"
        aria-label="Menu do Consta"
        aria-hidden={sidebar.width === 0}
        inert={sidebar.width === 0}
      >
        <div className="sidebar-inner">
          <div className="sidebar-top">
            <div className="sidebar-brand-row">
              <Link
                to={routePaths.calendar}
                className="brand-link"
                aria-label="CONSTA. — início"
                onClick={sidebar.closeOnMobile}
              >
                <Brand />
              </Link>
              <button
                type="button"
                className="sidebar-collapse-button"
                onClick={sidebar.close}
                aria-label="Fechar menu"
                title="Fechar menu"
              >
                <PanelLeftClose size={17} />
              </button>
            </div>
            <section
              className="sidebar-add-card sidebar-upload-control"
              aria-label="Envio do Termo de Contrato (TC)"
            >
              <button
                type="button"
                className="sidebar-upload-action"
                onClick={() => {
                  sidebar.closeOnMobile();
                  setEditing(null);
                }}
              >
                <Upload size={19} aria-hidden="true" />
                <span>{contractCopy.upload}</span>
              </button>
              <ContextHelp
                label={contractCopy.uploadHelp}
                text={contractCopy.uploadDescription}
              />
            </section>
          </div>
          <div className="sidebar-main">
            <nav aria-label="Navegação principal">
              <NavLink
                to={routePaths.calendar}
                end
                onClick={sidebar.closeOnMobile}
              >
                <CalendarDays size={19} />
                <span>{crmPageCopy.calendar.title}</span>
              </NavLink>
              <NavLink
                to={routePaths.contracts}
                end
                onClick={sidebar.closeOnMobile}
              >
                <FileText size={19} />
                <span>{crmPageCopy.contracts.title}</span>
              </NavLink>
              <NavLink
                to={routePaths.assets}
                end
                onClick={() => {
                  setEquipmentInitialFilter("all");
                  setEquipmentListRevision((value) => value + 1);
                  sidebar.closeOnMobile();
                }}
              >
                <LayoutGrid size={19} />
                <span>{crmPageCopy.assets.title}</span>
              </NavLink>
            </nav>
            {pendingRepairCount > 0 && (
              <div className="sidebar-attention">
                <span className="sidebar-section-label">Precisa de ação</span>
                <Link
                  to={routePaths.assets}
                  onClick={() => {
                    setQuery("");
                    setEquipmentInitialFilter("broken");
                    setEquipmentListRevision((value) => value + 1);
                    sidebar.closeOnMobile();
                  }}
                >
                  <Wrench size={17} aria-hidden="true" />
                  <span>Reparos pendentes</span>
                  <strong
                    aria-label={`${pendingRepairCount} equipamentos com reparo pendente`}
                  >
                    {pendingRepairCount}
                  </strong>
                </Link>
              </div>
            )}
          </div>
          <div className="sidebar-bottom">
            <button
              type="button"
              onClick={() => {
                sidebar.closeOnMobile();
                setHelp(true);
              }}
            >
              <CircleHelp size={17} /> Como funciona
            </button>
            {config?.passwordRequired && (
              <button
                type="button"
                onClick={async () => {
                  await api("/logout", { method: "POST" });
                  refreshConfig();
                }}
              >
                <LogOut size={16} /> Sair
              </button>
            )}
            <span className="version">CONSTA. / FASE 01</span>
          </div>
        </div>
        <div
          role="separator"
          aria-label="Ajustar menu. Arraste para fechar; use as setas para ajustar, Home para fechar e End para restaurar."
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={340}
          aria-valuenow={sidebar.width}
          tabIndex={sidebar.width > 0 ? 0 : -1}
          className="sidebar-resize-handle"
          {...sidebar.resizeProps}
        >
          <span />
        </div>
      </aside>
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-context">
            <button
              type="button"
              className={`sidebar-reopen ${sidebar.width > 0 ? "is-open" : ""}`}
              aria-label="Abrir menu"
              title="Abrir menu"
              onClick={sidebar.restore}
            >
              <PanelLeftOpen size={19} />
            </button>
            <div className="breadcrumb">
              Espaço de trabalho <span>/</span>
              <strong>
                {crmPageCopy[view].title}
              </strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="local-status">
              <i />
              Ambiente local
            </span>
            <div className="avatar" title="Engenharia clínica">
              EC
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <h1 ref={pageTitle} tabIndex={-1}>
                {crmPageCopy[view].title}
              </h1>
              <p>
                {crmPageCopy[view].description}
              </p>
            </div>
            {view !== "calendar" && (
              <button
                className="button primary"
                onClick={() => setEditing(null)}
              >
                <Plus size={18} />
                {crmPageCopy[view].create}
              </button>
            )}
          </div>
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
          <Suspense
            fallback={
              <div role="status" className="empty-inventory">
                <LoaderCircle className="spin" size={22} /> Carregando página…
              </div>
            }
          >
            <Routes>
              <Route
                path={routePaths.calendar}
                element={
                  <CalendarPage
                    query={query}
                    onQuery={setQuery}
                    month={month}
                    onMonth={setMonth}
                    days={days}
                    selection={selection}
                    onSelection={setSelection}
                    onDay={setViewingDay}
                    onEvent={openEvent}
                    events={filteredEvents}
                    loading={loading}
                    today={today}
                  />
                }
              />
              <Route
                path={routePaths.contracts}
                element={
                  <ContractsPage
                    contracts={contracts}
                    assets={assets}
                    query={query}
                    onQuery={setQuery}
                    onOpen={openContract}
                    onChanged={(updated) => {
                      setContracts((current) =>
                        current.some((contract) => contract.id === updated.id)
                          ? current.map((contract) =>
                              contract.id === updated.id ? updated : contract,
                            )
                          : [updated, ...current],
                      );
                    }}
                  />
                }
              />
              <Route
                path={routePaths.assets}
                element={
                  <EquipmentPage
                    key={equipmentListRevision}
                    initialFilter={equipmentInitialFilter}
                    assets={filteredAssets}
                    query={query}
                    onQuery={setQuery}
                    today={today}
                    onView={setViewingAsset}
                    onAssign={setAssigningMaintenance}
                    onBreakdown={openBreakdown}
                    onCreate={() => setEditing(null)}
                  />
                }
              />
              <Route
                path="/"
                element={
                  <Navigate to={legacyDestination(location.hash)} replace />
                }
              />
              <Route
                path="*"
                element={<Navigate to={routePaths.calendar} replace />}
              />
            </Routes>
          </Suspense>
          {view !== "calendar" && (
            <footer className="page-footer">
              <span>
                CONSTA<span className="orange-dot">.</span> Gestão de ativos e manutenção hospitalar.
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
          contracts={contracts}
          aiReady={config?.aiReady || false}
          onClose={() => {
            setEditing(undefined);
            setRevision((value) => value + 1);
          }}
          onSaved={onSaved}
          onImported={(result) => {
            setAssets(current => [
              ...current.filter(asset => !result.assets.some(saved => saved.id === asset.id)),
              ...result.assets,
            ]);
            const { extraction: _extraction, ...summary } = result.contract;
            setContracts(current => [summary, ...current.filter(item => item.id !== summary.id)]);
            setRevision(value => value + 1);
            setToast(result.createdCount
              ? `${result.createdCount} ${result.createdCount === 1 ? "equipamento cadastrado" : "equipamentos cadastrados"} no TC.`
              : "Os equipamentos deste TC já estão cadastrados.");
          }}
          onBreakdown={openBreakdown}
        />
      )}
      {viewingDay && (
        <DayScheduleDialog
          key={viewingDay}
          date={viewingDay}
          events={events}
          loading={loading}
          error={error}
          onClose={() => setViewingDay(null)}
          onView={openEvent}
        />
      )}
      {viewingAsset && (
        <AssetOverview
          asset={
            assets.find((asset) => asset.id === viewingAsset.id) || viewingAsset
          }
          today={today}
          onBreakdown={openBreakdown}
          onClose={() => setViewingAsset(null)}
          onEdit={() => setEditing(viewingAsset)}
          onContract={openContract}
        />
      )}
      {viewingContract && (
        <ContractViewer
          contractId={viewingContract}
          initialView={contractInitialView}
          assets={assets}
          contracts={contracts}
          onContractChanged={(updated) =>
            setContracts((current) =>
              current.some((item) => item.id === updated.id)
                ? current.map((item) =>
                    item.id === updated.id ? updated : item,
                  )
                : [updated, ...current],
            )
          }
          onClose={() => setViewingContract(null)}
          onBreakdown={openBreakdown}
          onEditAsset={(asset) => {
            setEditing(asset);
          }}
          onContract={openContract}
        />
      )}
      {editingCoverage && (
        <CoverageDatesDialog
          key={editingCoverage.coverageId}
          {...editingCoverage}
          onOpenDocument={openContract}
          onClose={() => setEditingCoverage(null)}
          onSaved={(updated) => {
            setAssets((current) =>
              current.map((asset) =>
                asset.id === updated.id ? updated : asset,
              ),
            );
            setEditingCoverage(null);
            setRevision((value) => value + 1);
            setToast("Datas salvas. Situação do equipamento atualizada.");
          }}
        />
      )}
      {assigningMaintenance && (
        <MaintenanceAssignment
          key={assigningMaintenance.id}
          asset={assigningMaintenance}
          onOpenDocument={openContract}
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
            setRevision((value) => value + 1);
            setToast(
              (updated.maintenanceDocuments?.length || 0) >
                (assigningMaintenance.maintenanceDocuments?.length || 0)
                ? "Arquivo salvo no histórico do equipamento."
                : "Responsável pela manutenção atualizado.",
            );
          }}
        />
      )}
      {repairTarget && repairAsset && (
        <EquipmentBreakdown
          key={`${repairTarget.assetId}:${repairTarget.action}`}
          asset={repairAsset}
          mode={repairTarget.action}
          onSaved={assetUpdated}
          onClose={() => setRepairTarget(null)}
          onChangeMode={(action) =>
            setRepairTarget({ assetId: repairAsset.id, action })
          }
        />
      )}
      {toast &&
        createPortal(
          <div className="toast" role="status">
            <Check size={17} />
            <span>{toast}</span>
            {toastCalendar?.message === toast && editing === undefined && (
              <button
                className="toast-calendar-link"
                onClick={() => showRepairOnCalendar(toastCalendar.date)}
              >
                Ver no calendário <ArrowRight size={13} />
              </button>
            )}
            <button onClick={() => setToast("")} aria-label="Fechar aviso">
              <X size={15} />
            </button>
          </div>,
          document.body,
        )}
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <ManagedDialog
      onRequestClose={onClose}
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
        <span className="eyebrow">UM FLUXO SIMPLES</span>
        <h2 id="help-title">Do Termo de Contrato ao calendário.</h2>
        <ol>
          <li>
            <strong>Envie o Termo de Contrato (TC).</strong> Selecione o PDF ou TXT do contrato principal dos equipamentos. Contrato de manutenção e termo aditivo são documentos opcionais, que podem ser vinculados depois.
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
    </ManagedDialog>
  );
}
