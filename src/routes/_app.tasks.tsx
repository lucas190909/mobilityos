import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader, StatusPill } from "@/components/ui-bits";
import { ALL_TASKS, CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — MobilityOS" }] }),
  component: TasksPage,
});

const COLUMNS = ["Todo", "In Progress", "Done"] as const;

function TasksPage() {
  const tasks = ALL_TASKS.slice(0, 36).map(t => ({
    ...t,
    clientName: CLIENTS.find(c => c.id === t.clientId)?.name ?? "",
  }));

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Every action your team needs to take, organized by status and priority."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(col => (
          <Card key={col} className="bg-secondary/30">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col}</h3>
              <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            <ul className="space-y-2">
              {tasks.filter(t => t.status === col).map(t => (
                <li key={t.id} className="rounded-lg border border-border bg-card p-3 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium leading-5">{t.title}</div>
                    <StatusPill status={t.priority} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <Link to="/clients/$id" params={{ id: t.clientId }} className="truncate hover:text-primary">
                      {t.clientName}
                    </Link>
                    <span>Due {t.deadline}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
