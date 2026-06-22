import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Users, MailWarning as FileWarning, Clock, Send, CircleCheck as CheckCircle2, TrendingUp, Wallet, ShieldCheck, FileText, CalendarDays, MessageSquare, Upload, Mail, SquareCheck as CheckSquare, TriangleAlert as AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  EmptyHint,
  PageHeader,
  SectionTitle,
  StatusPill,
  Avatar,
} from "@/components/ui-bits";
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

const COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#16A34A",
  "#F59E0B",
  "#9333EA",
  "#EF4444",
  "#64748B",
  "#EC4899",
];

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
  tone?: "default" | "primary" | "warning" | "success" | "danger";
}) {
  const toneCls: Record<string, string> = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={"flex h-8 w-8 items-center justify-center rounded-lg " + toneCls[tone]}>
          <Icon className="h-4 w-4" />
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
    return <DashboardSkeleton />;
  }

  const k = selectKpis(clients);
  const byCountry = selectApplicationsByCountry(clients);
  const byStage = selectClientsByStage(clients);
  const activity = selectRecentActivity(clients);
  const urgent = selectUrgentTasks(clients);
  const maxStage = Math.max(...byStage.map((x) => x.count), 1);

  // Demo revenue data
  const revenueData = [
    { month: "Jan", revenue: 12500 },
    { month: "Feb", revenue: 18200 },
    { month: "Mar", revenue: 22400 },
    { month: "Apr", revenue: 19800 },
    { month: "May", revenue: 28100 },
    { month: "Jun", revenue: 31500 },
  ];

  // Growth data
  const growthData = [
    { month: "Jan", clients: 12 },
    { month: "Feb", clients: 18 },
    { month: "Mar", clients: 25 },
    { month: "Apr", clients: 32 },
    { month: "May", clients: 38 },
    { month: "Jun", clients: clients.length },
  ];

  // University data
  const uniData = clients
    .flatMap((c) => c.universities.map((u) => u.name))
    .reduce((acc: Record<string, number>, name) => {
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});
  const uniChartData = Object.entries(uniData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Visa approval rate
  const visaRate = clients.length > 0 ? Math.round((k.visasApproved / clients.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Executive overview of every active mobility journey across your agency."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Total Clients" value={k.total} icon={Users} tone="primary" />
        <Kpi label="Active Apps" value={k.active} delta="+8%" icon={TrendingUp} tone="primary" />
        <Kpi label="Pending Visas" value={k.deadlines} icon={ShieldCheck} tone="warning" />
        <Kpi label="Missing Docs" value={k.waitingDocs} icon={FileWarning} tone="danger" />
        <Kpi label="Upcoming" value={k.deadlines} icon={Clock} tone="warning" />
        <Kpi label="Submitted" value={k.submitted} icon={Send} tone="success" />
        <Kpi label="Approval Rate" value={`${visaRate}%`} icon={CheckCircle2} tone="success" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition hover:shadow-md">
          <SectionTitle
            right={<span className="text-xs text-muted-foreground">Last 6 months</span>}
          >
            Application Pipeline
          </SectionTitle>
          <div className="h-72">
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

        <Card className="transition hover:shadow-md">
          <SectionTitle>Clients by Stage</SectionTitle>
          <div className="space-y-3">
            {byStage.map((s, i) => (
              <div key={s.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80">{s.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(s.count / maxStage) * 100}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="transition hover:shadow-md">
          <SectionTitle>Applications by University</SectionTitle>
          <div className="h-64">
            {uniChartData.length === 0 ? (
              <EmptyHint>No university data yet.</EmptyHint>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={uniChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {uniChartData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="transition hover:shadow-md">
          <SectionTitle>Monthly Revenue</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="transition hover:shadow-md">
          <SectionTitle>Monthly Client Growth</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                <Bar dataKey="clients" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activity + Tasks Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition hover:shadow-md">
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
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition hover:bg-secondary/20 rounded-lg px-2 -mx-2"
                >
                  <ActivityIcon type={e.type} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      <Link
                        to="/clients/$id"
                        params={{ id: e.clientId }}
                        className="hover:text-primary hover:underline"
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

        <Card className="transition hover:shadow-md">
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
                  className="rounded-lg border border-border p-3 transition hover:border-primary/40 hover:shadow-sm"
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

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Consultation: MessageSquare,
    Documents: FileText,
    Application: Send,
    Offer: CheckCircle2,
    Visa: ShieldCheck,
    English: FileText,
    Travel: CalendarDays,
  };
  const Icon = iconMap[type] ?? AlertTriangle;
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground text-[11px] font-medium">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Loading your executive overview…" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse bg-secondary/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 h-72 animate-pulse bg-secondary/50" />
        <Card className="h-72 animate-pulse bg-secondary/50" />
      </div>
    </div>
  );
}
