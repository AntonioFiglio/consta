import { SearchField } from "./SearchField";
import { useId, useState } from "react";
import { CalendarDays, ChevronRight, Wrench, LoaderCircle } from "lucide-react";
import { ManagedDialog } from "./DialogManager";
import type { MaintenanceEvent } from "./types";

export function DayScheduleDialog({ date, events, loading, error, onClose, onView }: {
  date: string;
  events: MaintenanceEvent[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onView: (event: MaintenanceEvent) => void;
}) {
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "preventive" | "corrective">("all");
  const daily = events.filter(event => event.date === date);
  const repairs = daily.filter(event => event.kind === "corrective").length;
  const search = query.trim().toLocaleLowerCase("pt-BR");
  const visible = daily.filter(event =>
    (filter === "all" || (event.kind || "preventive") === filter) &&
    `${event.name} ${event.patrimony} ${event.sector}`.toLocaleLowerCase("pt-BR").includes(search),
  ).sort((a, b) => a.sector.localeCompare(b.sector, "pt-BR") || a.name.localeCompare(b.name, "pt-BR") || a.patrimony.localeCompare(b.patrimony, "pt-BR"));
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const weekday = new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long" });
  const groups = [
    { kind: "corrective", label: "Reparos agendados", icon: Wrench },
    { kind: "preventive", label: "Preventivas previstas", icon: CalendarDays },
  ] as const;
  return (
    <ManagedDialog
      className="day-schedule-dialog"
      aria-labelledby={titleId}
      onRequestClose={onClose}
      onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
    >
      <header className="document-header">
        <div>
          <span className="eyebrow">AGENDAMENTOS DO DIA · {weekday}</span>
          <h2 id={titleId}>{dateLabel}</h2>
          <p>{loading ? "Carregando agendamentos…" : `${daily.length} ${daily.length === 1 ? "manutenção neste dia" : "manutenções neste dia"}`}</p>
        </div>
      </header>
      <div className="day-schedule-controls">
        <SearchField value={query} onChange={setQuery} placeholder="Buscar equipamento, tombamento ou setor" label="Buscar nos agendamentos do dia" />
        <div className="day-schedule-filters" aria-label="Filtrar agendamentos por tipo">
          {([
            ["all", "Todos", daily.length],
            ["preventive", "Preventivas", daily.length - repairs],
            ["corrective", "Reparos", repairs],
          ] as const).map(([value, label, count]) => (
            <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{count}</span></button>
          ))}
        </div>
      </div>
      <div className="day-schedule-list" aria-busy={loading}>
        {loading ? <div className="document-empty" role="status"><LoaderCircle className="spin" size={22} /><p>Carregando agendamentos…</p></div>
          : error ? <p role="alert" className="error-message">Não foi possível carregar todos os agendamentos. {error}</p>
          : !visible.length ? <div className="document-empty"><CalendarDays size={25} /><h3>{daily.length ? "Nenhum resultado neste filtro" : "Nenhuma manutenção prevista"}</h3><p>{daily.length ? "Busque por outro equipamento ou selecione Todos." : "Este dia ainda não tem agendamentos."}</p>{daily.length > 0 && <button className="text-button" onClick={() => { setQuery(""); setFilter("all"); }}>Limpar filtros</button>}</div>
          : groups.map(({ kind, label, icon: Icon }) => {
            const items = visible.filter(event => (event.kind || "preventive") === kind);
            return items.length > 0 && <section key={kind} className={`day-schedule-group ${kind}`} aria-label={label}>
              <h3><Icon size={14} aria-hidden="true" />{label}<span>{items.length}</span></h3>
              <ul>{items.map(event => <li key={event.id}>
                <button type="button" className="day-schedule-event" onClick={() => onView(event)} aria-label={`Ver ficha de ${event.name}, tombamento ${event.patrimony}`}>
                  <div><strong>{event.name}</strong><span><span className="mono">{event.patrimony}</span><span aria-hidden="true"> · </span>{event.sector || "Setor não informado"}</span>{event.simulated && <small>Dados simulados</small>}</div>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>)}</ul>
            </section>;
          })}
      </div>
      <footer className="document-footer"><span role="status">{visible.length} de {daily.length} agendamentos · Datas sem horário definido</span></footer>
    </ManagedDialog>
  );
}
