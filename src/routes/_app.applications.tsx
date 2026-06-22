import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TriangleAlert as AlertTriangle, CalendarDays, GraduationCap, MapPin, MoveHorizontal as MoreHorizontal, User, Clock } from "lucide-react";
import { PageHeader, Avatar, StatusPill, Card } from "@/components/ui-bits";
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
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 w-72 shrink-0 animate-pulse rounded-xl bg-secondary/50" />
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
                  "flex w-80 shrink-0 flex-col rounded-xl border transition " +
                  (isOver
                    ? "border-primary/60 bg-primary/5 shadow-md"
                    : "border-border bg-secondary/20")
                }
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{stage}</span>
                    <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground border border-border">
                      {items.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-2 min-h-[100px]">
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
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Drop clients here
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
    consultant?: string;
    documents: { status: string }[];
  };
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const missingDocs = c.documents.filter((d) => d.status === "Missing").length;
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
        className="block rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          <Avatar src={c.photo} name={c.name} size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{c.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {c.destination ?? ""} · {c.university ?? ""}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusPill status={c.priority} />
          {missingDocs > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
              <AlertTriangle className="h-2.5 w-2.5" /> {missingDocs}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {c.consultant ?? "—"}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {c.deadline ?? "—"}
          </div>
        </div>
      </Link>
    </div>
  );
}
