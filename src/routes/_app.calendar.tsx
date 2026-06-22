import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, CalendarDays, Clock, X, LayoutGrid, List, Columns2 as Columns } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { ConfirmDialog } from "@/components/dialogs";
import type { CalendarEvent } from "@/lib/database";

type ViewMode = "month" | "week" | "day" | "agenda";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — MobilityOS" }] }),
  component: CalendarPage,
});

const EVENT_COLORS: Record<string, string> = {
  Meeting: "bg-blue-500/15 text-blue-600 border-blue-300/40",
  Deadline: "bg-red-500/15 text-red-600 border-red-300/40",
  "Visa Appointment": "bg-purple-500/15 text-purple-600 border-purple-300/40",
  Travel: "bg-green-500/15 text-green-600 border-green-300/40",
  Task: "bg-orange-500/15 text-orange-600 border-orange-300/40",
  "Application Deadline": "bg-pink-500/15 text-pink-600 border-pink-300/40",
  default: "bg-primary/10 text-primary border-primary/30",
};

function CalendarPage() {
  const {
    clients,
    calendarEvents,
    isLoading,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events: Record<
    string,
    { title: string; type: string; clientId?: string; eventId?: string; color: string }[]
  > = {};

  clients.forEach((c) => {
    c.tasks.forEach((t) => {
      if (t.deadline) {
        (events[t.deadline] ||= []).push({
          title: t.title,
          type: "Task",
          clientId: t.client_id,
          color: EVENT_COLORS.Task,
        });
      }
    });
    if (c.deadline) {
      (events[c.deadline] ||= []).push({
        title: `${c.name} deadline`,
        type: "Application Deadline",
        clientId: c.id,
        color: EVENT_COLORS["Application Deadline"],
      });
    }
  });

  calendarEvents.forEach((e) => {
    (events[e.date] ||= []).push({
      title: e.title,
      type: e.type || "Event",
      clientId: e.client_id ?? undefined,
      eventId: e.id,
      color: EVENT_COLORS[e.type || "default"] || EVENT_COLORS.default,
    });
  });

  const monthName = first.toLocaleString("en-US", { month: "long", year: "numeric" });
  const today = new Date();

  const prev = () => {
    if (viewMode === "month") setCurrentDate(new Date(year, month - 1, 1));
    else if (viewMode === "week") setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
    else setCurrentDate(new Date(year, month, currentDate.getDate() - 1));
  };
  const next = () => {
    if (viewMode === "month") setCurrentDate(new Date(year, month + 1, 1));
    else if (viewMode === "week") setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
    else setCurrentDate(new Date(year, month, currentDate.getDate() + 1));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const title = fd.get("title") as string;
    const date = fd.get("date") as string;
    const type = fd.get("type") as string;
    const description = fd.get("description") as string;

    if (!title || !date) {
      toast.error("Title and date are required");
      return;
    }

    if (editingEvent) {
      await updateCalendarEvent(editingEvent.id, { title, date, type, description });
    } else {
      await addCalendarEvent({ title, date, type, description });
    }
    setEventOpen(false);
    setEditingEvent(undefined);
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCalendarEvent(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const allEvents = Object.entries(events)
    .flatMap(([date, list]) => list.map((e) => ({ ...e, date })))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Calendar" description="Loading…" />
        <Card className="h-[600px] animate-pulse bg-secondary/50" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Meetings, deadlines, visa appointments, and team tasks in one view."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-secondary/40 p-0.5">
              {(["month", "week", "day", "agenda"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={
                    "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium capitalize transition " +
                    (viewMode === v
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setEditingEvent(undefined);
                setEventOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Event
            </button>
          </div>
        }
      />

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold">{monthName}</h3>
            <button
              onClick={next}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Today:{" "}
            {today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {viewMode === "month" && (
          <MonthView
            year={year}
            month={month}
            startOffset={startOffset}
            daysInMonth={daysInMonth}
            events={events}
            today={today}
            onEventClick={(ev) => {
              if (ev.eventId) {
                const found = calendarEvents.find((ce) => ce.id === ev.eventId);
                if (found) {
                  setEditingEvent(found);
                  setEventOpen(true);
                }
              }
            }}
          />
        )}
        {viewMode === "agenda" && (
          <AgendaView
            events={allEvents}
            onEventClick={(ev) => {
              if (ev.eventId) {
                const found = calendarEvents.find((ce) => ce.id === ev.eventId);
                if (found) {
                  setEditingEvent(found);
                  setEventOpen(true);
                }
              }
            }}
          />
        )}
        {(viewMode === "week" || viewMode === "day") && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {viewMode === "week" ? "Week view" : "Day view"} — switch to Month or Agenda for full
            functionality
          </div>
        )}
      </Card>

      {/* Event Dialog */}
      {eventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingEvent ? "Edit Event" : "Add Event"}</h3>
              <button
                onClick={() => {
                  setEventOpen(false);
                  setEditingEvent(undefined);
                }}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEventSubmit} className="mt-4 space-y-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Title *</span>
                <input
                  name="title"
                  defaultValue={editingEvent?.title ?? ""}
                  required
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Date *</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={editingEvent?.date ?? new Date().toISOString().slice(0, 10)}
                  required
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Type</span>
                <select
                  name="type"
                  defaultValue={editingEvent?.type ?? ""}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="">General</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Visa Appointment">Visa Appointment</option>
                  <option value="Travel">Travel</option>
                  <option value="Task">Task</option>
                  <option value="Application Deadline">Application Deadline</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Description</span>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description ?? ""}
                  className="min-h-[80px] rounded-lg border border-input bg-background p-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEventOpen(false);
                    setEditingEvent(undefined);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  {editingEvent ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this event?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function MonthView({
  year,
  month,
  startOffset,
  daysInMonth,
  events,
  today,
  onEventClick,
}: {
  year: number;
  month: number;
  startOffset: number;
  daysInMonth: number;
  events: Record<
    string,
    { title: string; type: string; clientId?: string; eventId?: string; color: string }[]
  >;
  today: Date;
  onEventClick: (ev: { eventId?: string }) => void;
}) {
  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }

  return (
    <>
      <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-3 py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const dayEvents = c ? (events[c.key] ?? []) : [];
          const isToday =
            c?.day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          return (
            <div
              key={i}
              className={
                "min-h-[100px] border-b border-r border-border p-2 text-xs " +
                ((i + 1) % 7 === 0 ? "border-r-0 " : "") +
                (!c ? "bg-secondary/20 " : "")
              }
            >
              {c && (
                <>
                  <div
                    className={
                      "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium " +
                      (isToday ? "bg-primary text-primary-foreground" : "text-foreground/70")
                    }
                  >
                    {c.day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e, j) =>
                      e.clientId ? (
                        <Link
                          key={j}
                          to="/clients/$id"
                          params={{ id: e.clientId }}
                          className={
                            "block truncate rounded-md px-1.5 py-0.5 text-[10px] transition hover:opacity-80 " +
                            e.color
                          }
                        >
                          {e.title}
                        </Link>
                      ) : (
                        <button
                          key={j}
                          onClick={() => onEventClick(e)}
                          className={
                            "block w-full truncate rounded-md px-1.5 py-0.5 text-[10px] text-left transition hover:opacity-80 " +
                            e.color
                          }
                        >
                          {e.title}
                        </button>
                      ),
                    )}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function AgendaView({
  events,
  onEventClick,
}: {
  events: {
    date: string;
    title: string;
    type: string;
    clientId?: string;
    eventId?: string;
    color: string;
  }[];
  onEventClick: (ev: { eventId?: string }) => void;
}) {
  const grouped: Record<string, typeof events> = {};
  events.forEach((e) => {
    (grouped[e.date] ||= []).push(e);
  });

  return (
    <div className="divide-y divide-border">
      {Object.entries(grouped).length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">No events</div>
      ) : (
        Object.entries(grouped).map(([date, list]) => (
          <div key={date} className="p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {date}
            </div>
            <div className="space-y-2">
              {list.map((e, i) => (
                <button
                  key={i}
                  onClick={() => onEventClick(e)}
                  className={
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:shadow-sm " +
                    e.color
                  }
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs opacity-70">{e.type}</div>
                  </div>
                  {e.clientId && (
                    <Link
                      to="/clients/$id"
                      params={{ id: e.clientId }}
                      className="text-xs hover:underline"
                    >
                      View client
                    </Link>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
