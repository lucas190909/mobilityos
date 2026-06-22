import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Clock, Users, SquareCheck as CheckSquare, TriangleAlert as AlertTriangle, TrendingUp, Activity, CalendarDays, ShieldCheck, FileCheck, X } from "lucide-react";
import { Card, PageHeader, Avatar, StatusPill, EmptyHint } from "@/components/ui-bits";
import { TEAM } from "@/lib/database";
import { useData } from "@/lib/data-provider";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — MobilityOS" }] }),
  component: TeamPage,
});

const PERMISSIONS: Record<string, string[]> = {
  Administrator: ["Manage agency", "Manage team", "All clients", "Billing", "Settings"],
  Consultant: ["Own clients", "Documents", "Tasks", "Calendar"],
  Assistant: ["Tasks", "Documents (read)", "Calendar"],
};

function TeamPage() {
  const { clients, isLoading } = useData();
  const [selectedMember, setSelectedMember] = useState<(typeof TEAM)[0] | null>(null);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Team" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate metrics per member
  const memberMetrics = TEAM.map((m) => {
    const memberClients = clients.filter((c) => c.consultant === m.name);
    const activeClients = memberClients.filter((c) => c.status !== "Completed").length;
    const openTasks = clients
      .filter((c) => c.consultant === m.name)
      .flatMap((c) => c.tasks)
      .filter((t) => t.status !== "Done").length;
    const overdueTasks = clients
      .filter((c) => c.consultant === m.name)
      .flatMap((c) => c.tasks)
      .filter((t) => t.status !== "Done" && new Date(t.deadline) < new Date()).length;
    const completedApps = memberClients.filter((c) => c.status === "Completed").length;
    const totalApps = memberClients.length;
    const performanceScore = totalApps > 0 ? Math.round((completedApps / totalApps) * 100) : 0;

    return {
      ...m,
      activeClients,
      openTasks,
      overdueTasks,
      performanceScore,
      totalApps,
    };
  });

  return (
    <div>
      <PageHeader
        title="Team"
        description="Agency members, roles, performance, and access permissions."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memberMetrics.map((m) => (
          <Card
            key={m.id}
            className="cursor-pointer transition hover:shadow-md hover:border-primary/20"
            onClick={() => setSelectedMember(m)}
          >
            <div className="flex items-center gap-3">
              <Avatar src={m.photo} name={m.name} size={48} />
              <div className="min-w-0">
                <div className="truncate font-medium">{m.name}</div>
                <div className="truncate text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="ml-auto">
                <StatusPill status={m.role} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric icon={Users} label="Clients" value={m.activeClients} />
              <Metric icon={CheckSquare} label="Tasks" value={m.openTasks} />
              <Metric
                icon={AlertTriangle}
                label="Overdue"
                value={m.overdueTasks}
                warning={m.overdueTasks > 0}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Performance</span>
                <span className="font-medium">{m.performanceScore}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${m.performanceScore}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Permissions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSIONS[m.role].map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground/80"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar src={selectedMember.photo} name={selectedMember.name} size={48} />
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <div className="text-sm text-muted-foreground">{selectedMember.role}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <DetailMetric
                icon={Users}
                label="Active Clients"
                value={selectedMember.activeClients}
              />
              <DetailMetric
                icon={CheckSquare}
                label="Open Tasks"
                value={selectedMember.openTasks}
              />
              <DetailMetric
                icon={AlertTriangle}
                label="Overdue"
                value={selectedMember.overdueTasks}
                warning
              />
              <DetailMetric
                icon={TrendingUp}
                label="Performance"
                value={`${selectedMember.performanceScore}%`}
              />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Assigned Clients</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clients
                  .filter((c) => c.consultant === selectedMember.name)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to="/clients/$id"
                      params={{ id: c.id }}
                      onClick={() => setSelectedMember(null)}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm transition hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar src={c.photo} name={c.name} size={28} />
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <StatusPill status={c.status} />
                    </Link>
                  ))}
                {clients.filter((c) => c.consultant === selectedMember.name).length === 0 && (
                  <EmptyHint>No assigned clients.</EmptyHint>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Activity</h4>
              <div className="text-sm text-muted-foreground">
                Last login: Today at 9:30 AM · Response time: ~2 hours
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  warning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-2 text-center">
      <Icon
        className={"h-3.5 w-3.5 mb-1 " + (warning ? "text-destructive" : "text-muted-foreground")}
      />
      <div className={"text-sm font-semibold " + (warning ? "text-destructive" : "")}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function DetailMetric({
  icon: Icon,
  label,
  value,
  warning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  warning?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3 text-center">
      <Icon
        className={"h-4 w-4 mb-1.5 " + (warning ? "text-destructive" : "text-muted-foreground")}
      />
      <div className={"text-lg font-semibold " + (warning ? "text-destructive" : "")}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
