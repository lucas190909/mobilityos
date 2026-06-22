import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Users, MailWarning as FileWarning, Clock, Send, CircleCheck as CheckCircle2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyHint, PageHeader, SectionTitle, StatusPill } from "@/components/ui-bits";
import {
  selectApplicationsByCountry,
  selectClientsByStage,
  selectKpis,
  selectRecentActivity,
  selectUrgentTasks,
} from "@/lib/database";
import { useData } from "@/lib/data-provider";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Dashboard — MobilityOS" }] }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "primary" | "warning" | "success";
}) {
  const toneCls: Record<string, string> = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success",
  };
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={"flex h-7 w-7 items-center justify-center rounded-md " + toneCls[tone]}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        {delta && (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
            <ArrowUpRight className="h-3 w-3" /> {delta}
          </span>
        )}
      </div>
    </Card>
  );
}

function Dashboard() {
  const { clients, isLoading } = useData();

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Overview of every active mobility journey across your agency."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  const k = selectKpis(clients);
  const byCountry = selectApplicationsByCountry(clients);
  const byStage = selectClientsByStage(clients);
  const activity = selectRecentActivity(clients);
  const urgent = selectUrgentTasks(clients);
  const maxStage = Math.max(...byStage.map((x) => x.count), 1);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of every active mobility journey across your agency."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi label="Active Clients" value={k.active} delta="+8%" icon={Users} tone="primary" />
        <Kpi label="Waiting Documents" value={k.waitingDocs} icon={FileWarning} tone="warning" />
        <Kpi label="Upcoming Deadlines" value={k.deadlines} icon={Clock} tone="warning" />
        <Kpi label="Submitted Applications" value={k.submitted} icon={Send} tone="primary" />
        <Kpi
          label="Approved Visas"
          value={k.visasApproved}
          delta="+3"
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle right={<span className="text-xs text-muted-foreground">Last 30 days</span>}>
            Applications by Country
          </SectionTitle>
          <div className="h-64">
            {byCountry.length === 0 ? (
              <EmptyHint>No applications yet — add a client to get started.</EmptyHint>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCountry} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="country"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle>Clients by Stage</SectionTitle>
          <div className="space-y-3">
            {byStage.map((s, i) => (
              <div key={s.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80">{s.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(s.count / maxStage) * 100}%`,
                      background: `var(--color-chart-${(i % 5) + 1})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            right={
              <Link to="/clients" className="text-xs text-primary hover:underline">
                View all
              </Link>
            }
          >
            Recent Activity
          </SectionTitle>
          {activity.length === 0 ? (
            <EmptyHint>No activity yet.</EmptyHint>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((e) => (
                <li
                  key={e.id + e.clientId}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground text-[11px] font-medium">
                    {e.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      <Link
                        to="/clients/$id"
                        params={{ id: e.clientId }}
                        className="hover:underline"
                      >
                        {e.client}
                      </Link>{" "}
                      · {e.date}
                    </div>
                  </div>
                  <StatusPill status={e.type} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle
            right={
              <Link to="/tasks" className="text-xs text-primary hover:underline">
                All tasks
              </Link>
            }
          >
            Urgent Tasks
          </SectionTitle>
          {urgent.length === 0 ? (
            <EmptyHint>No urgent tasks right now.</EmptyHint>
          ) : (
            <ul className="space-y-3">
              {urgent.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border p-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t.title}</span>
                    <StatusPill status={t.priority} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <Link
                      to="/clients/$id"
                      params={{ id: t.client_id }}
                      className="truncate hover:text-primary"
                    >
                      {t.clientName}
                    </Link>
                    <span>Due {t.deadline}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
