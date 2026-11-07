import type { Dispatch, SetStateAction } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { SearchField } from "./SearchField";
import type { MaintenanceEvent } from "./types";

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
export function CalendarPage({
  query,
  onQuery,
  month,
  onMonth,
  days,
  selection,
  onSelection,
  onDay,
  onEvent,
  events,
  loading,
  today,
}: {
  query: string;
  onQuery: (query: string) => void;
  month: Date;
  onMonth: Dispatch<SetStateAction<Date>>;
  days: Date[];
  selection: string | null;
  onSelection: (date: string | null) => void;
  onDay: (date: string) => void;
  onEvent: (event: MaintenanceEvent) => void;
  events: MaintenanceEvent[];
  loading: boolean;
  today: string;
}) {
  const monthEvents = events.filter(
    (event) => event.date.slice(0, 7) === dateKey(month).slice(0, 7),
  );
  const agenda = selection
    ? events.filter((event) => event.date === selection)
    : monthEvents;
  const changeMonth = (offset: number) => {
    onMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1, 12),
    );
    onSelection(null);
  };
  return (
    <section className="calendar-section">
      <div className="section-toolbar">
        <SearchField
          value={query}
          onChange={onQuery}
          placeholder="Buscar equipamento ou tombamento"
          label="Buscar no calendário"
        />
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
                  onMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                      12,
                    ),
                  );
                  onSelection(today);
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
            {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div
            className={`calendar-grid ${loading ? "loading" : ""}`}
            aria-label={`Calendário de ${monthName(month)}`}
          >
            {days.map((day) => {
              const key = dateKey(day);
              const dayEvents = events.filter((event) => event.date === key);
              const outside = day.getMonth() !== month.getMonth();
              return (
                <div
                  key={key}
                  className={`calendar-cell ${outside ? "outside" : ""} ${key === today ? "is-today" : ""} ${key === selection ? "selected" : ""}`}
                >
                  <button
                    className="day-number"
                    aria-label={`Ver ${dayEvents.length} manutenções de ${prettyDate(key)}`}
                    onClick={() => {
                      onSelection(key);
                      onDay(key);
                    }}
                    aria-pressed={key === selection}
                  >
                    {day.getDate()}
                  </button>
                  <div className="cell-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        className={`calendar-event ${event.kind === "corrective" ? "corrective" : ""}`}
                        title={`${event.kind === "corrective" ? "Reparo agendado · Equipamento quebrado" : "Preventiva prevista"} · ${event.name} · ${event.patrimony}`}
                        onClick={() => onEvent(event)}
                      >
                        <i />
                        <span>
                          {event.kind === "corrective" ? "Reparo · " : ""}
                          {event.name}
                        </span>
                        <small>{event.patrimony}</small>
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <button
                        className="more-events"
                        aria-label={`Ver todas as ${dayEvents.length} manutenções de ${prettyDate(key)}`}
                        onClick={() => {
                          onSelection(key);
                          onDay(key);
                        }}
                      >
                        +{dayEvents.length - 2}{" "}
                        {dayEvents.length === 3 ? "manutenção" : "manutenções"}
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
            <span>
              <i className="legend-dot corrective" />
              Reparo de equipamento quebrado
            </span>
          </footer>
        </div>
        <aside className="agenda">
          <div className="agenda-heading">
            <div className="eyebrow">SUA AGENDA</div>
            <h3>{selection ? prettyDate(selection) : "Neste mês"}</h3>
            <p>
              {selection
                ? `${agenda.length} ${agenda.length === 1 ? "manutenção prevista neste dia" : "manutenções previstas neste dia"}`
                : `${monthEvents.length} ${monthEvents.length === 1 ? "manutenção para acompanhar" : "manutenções para acompanhar"}`}
            </p>
            {selection && (
              <button className="text-button" onClick={() => onSelection(null)}>
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
                  className={`agenda-event ${event.kind === "corrective" ? "corrective" : ""}`}
                  key={event.id}
                  onClick={() => onEvent(event)}
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
                      {event.kind === "corrective"
                        ? "REPARO AGENDADO · QUEBRADO"
                        : "PREVENTIVA PREVISTA"}
                    </span>
                    <strong>{event.name}</strong>
                    <span className="mono">{event.patrimony}</span>
                    <small>{event.sector || "Setor não informado"}</small>
                  </div>
                  <ChevronRight size={14} />
                </button>
              ))
            ) : (
              <div className="empty-agenda">
                <CalendarDays size={27} />
                <strong>Nenhuma manutenção por aqui</strong>
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
  );
}
