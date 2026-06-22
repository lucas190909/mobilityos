import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Avatar, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { STAGES, type Stage } from "@/lib/database";

export const Route = createFileRoute("/_app/applications")({
  head: () => ({ meta: [{ title: "Applications — MobilityOS" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { clients, isLoading, setClientStage } = useData();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const onDrop = async (stage: Stage) => {
    if (dragId) {
      const c = clients.find((x) => x.id === dragId);
      if (c && c.status !== stage) {
        await setClientStage(dragId, stage);
        toast.success(`${c.name} moved to ${stage}`);
      }
    }
    setDragId(null);
    setOverStage(null);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Application Pipeline" description="Loading…" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 w-72 animate-pulse rounded-xl bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Application Pipeline"
        description="Drag and drop clients between stages to update their journey."
      />

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3 px-1">
          {STAGES.map((stage) => {
            const items = clients.filter((c) => c.status === stage);
            const isOver = overStage === stage;
            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(stage);
                }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={() => onDrop(stage)}
                className={
                  "flex w-72 shrink-0 flex-col rounded-xl border bg-secondary/30 transition " +
                  (isOver ? "border-primary/60 bg-primary/5" : "border-border")
                }
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
                  {items.map((c) => (
                    <ClientCard
                      key={c.id}
                      client={c}
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverStage(null);
                      }}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Drop here
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

function ClientCard({
  client: c,
  onDragStart,
  onDragEnd,
}: {
  client: {
    id: string;
    name: string;
    photo: string;
    destination?: string;
    university?: string;
    deadline?: string;
    priority: string;
    status: string;
  };
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <Link
        to="/clients/$id"
        params={{ id: c.id }}
        className="block rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Avatar src={c.photo} name={c.name} size={28} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{c.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {c.destination ?? ""} · {c.university ?? ""}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Due {c.deadline ?? "—"}</span>
          <StatusPill status={c.priority} />
        </div>
      </Link>
    </div>
  );
}
