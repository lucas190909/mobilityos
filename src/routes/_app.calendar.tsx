import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/ui-bits";
import { ALL_TASKS, CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — MobilityOS" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const today = new Date("2026-04-15");
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events: Record<string, { title: string; type: string }[]> = {};
  ALL_TASKS.forEach(t => {
    const key = t.deadline;
    (events[key] ||= []).push({ title: t.title, type: t.priority });
  });
  CLIENTS.forEach(c => {
    if (c.deadline) (events[c.deadline] ||= []).push({ title: `${c.name} deadline`, type: "Application" });
  });

  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }

  const monthName = first.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader title="Calendar" description="Meetings, deadlines, visa appointments, and team tasks in one view." />

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">{monthName}</h3>
          <div className="text-xs text-muted-foreground">Today: April 15, 2026</div>
        </div>
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-xs font-medium text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="px-3 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const dayEvents = c ? events[c.key] ?? [] : [];
            const isToday = c?.day === today.getDate();
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
                    <div className={"mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] " + (isToday ? "bg-primary text-primary-foreground font-semibold" : "text-foreground/70")}>
                      {c.day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((e, j) => (
                        <div key={j} className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
