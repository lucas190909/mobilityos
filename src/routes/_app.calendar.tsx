import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyHint, PageHeader } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { ConfirmDialog } from "@/components/dialogs";
import type { CalendarEvent } from "@/lib/database";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — MobilityOS" }] }),
  component: CalendarPage,
});

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
    { title: string; type: string; clientId?: string; eventId?: string }[]
  > = {};

  // Tasks and client deadlines
  clients.forEach((c) => {
    c.tasks.forEach((t) => {
      if (t.deadline) {
        (events[t.deadline] ||= []).push({
          title: t.title,
          type: t.priority,
          clientId: t.client_id,
        });
      }
    });
    if (c.deadline) {
      (events[c.deadline] ||= []).push({
        title: `${c.name} deadline`,
        type: "Application",
        clientId: c.id,
      });
    }
  });

  // Calendar events
  calendarEvents.forEach((e) => {
    (events[e.date] ||= []).push({
      title: e.title,
      type: e.type,
      clientId: e.client_id ?? undefined,
      eventId: e.id,
    });
  });

  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }

  const monthName = first.toLocaleString("en-US", { month: "long", year: "numeric" });
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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
          <button
            onClick={() => {
              setEditingEvent(undefined);
              setEventOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        }
      />

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold">{monthName}</h3>
            <button
              onClick={nextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">Today: {todayLabel}</div>
        </div>
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
                        "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] " +
                        (isToday
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground/70")
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
                            className="block truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20"
                          >
                            {e.title}
                          </Link>
                        ) : (
                          <button
                            key={j}
                            onClick={() => {
                              if (e.eventId) {
                                const ev = calendarEvents.find((ce) => ce.id === e.eventId);
                                if (ev) {
                                  setEditingEvent(ev);
                                  setEventOpen(true);
                                }
                              }
                            }}
                            className="block w-full truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20 text-left"
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
      </Card>

      {/* Event Dialog */}
      {eventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{editingEvent ? "Edit Event" : "Add Event"}</h3>
            <form onSubmit={handleEventSubmit} className="mt-4 space-y-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Title *</span>
                <input
                  name="title"
                  defaultValue={editingEvent?.title ?? ""}
                  required
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Date *</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={editingEvent?.date ?? new Date().toISOString().slice(0, 10)}
                  required
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Type</span>
                <select
                  name="type"
                  defaultValue={editingEvent?.type ?? ""}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="">General</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Visa">Visa</option>
                  <option value="Offer">Offer</option>
                  <option value="Reminder">Reminder</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Description</span>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description ?? ""}
                  className="min-h-[60px] rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEventOpen(false);
                    setEditingEvent(undefined);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
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
