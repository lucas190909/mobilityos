import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { CLIENTS, STAGES } from "@/lib/mock-data";
import { Avatar, StatusPill } from "@/components/ui-bits";

export const Route = createFileRoute("/_app/applications")({
  head: () => ({ meta: [{ title: "Applications — MobilityOS" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return (
    <div>
      <PageHeader
        title="Application Pipeline"
        description="Drag-style kanban for every client journey, from first lead to arrival."
      />

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3 px-1">
          {STAGES.map(stage => {
            const items = CLIENTS.filter(c => c.status === stage);
            return (
              <div
                key={stage}
                className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-secondary/30"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{stage}</span>
                    <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {items.map(c => (
                    <Link
                      key={c.id}
                      to="/clients/$id"
                      params={{ id: c.id }}
                      className="block rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar src={c.photo} name={c.name} size={28} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{c.name}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{c.destination} · {c.university}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Due {c.deadline}</span>
                        <StatusPill status={c.priority} />
                      </div>
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
