import { createFileRoute } from "@tanstack/react-router";
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
import { TrendingUp, Users, Clock, FileCheck, GraduationCap, Target } from "lucide-react";
import { Card, EmptyHint, PageHeader, SectionTitle } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { selectApplicationsByCountry, selectClientsByStage, STAGES } from "@/lib/database";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MobilityOS" }] }),
  component: AnalyticsPage,
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

function AnalyticsPage() {
  const { clients, isLoading } = useData();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Loading insights…" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  const byCountry = selectApplicationsByCountry(clients);
  const byStage = selectClientsByStage(clients);
  const total = clients.length;
  const completed = clients.filter((c) => c.status === "Completed").length;
  const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const visaApproved = clients.filter((c) => c.visa_status === "Approved").length;
  const visaRate = total > 0 ? Math.round((visaApproved / total) * 100) : 0;

  // Average processing time (demo)
  const avgDays = 87;

  // Consultant performance
  const consultantPerf = Array.from(
    clients.reduce((acc, c) => {
      const name = c.consultant ?? "Unassigned";
      acc.set(name, (acc.get(name) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  ).map(([name, count]) => ({ name, count }));

  // Monthly growth (demo)
  const growthData = [
    { month: "Jan", clients: 8, revenue: 12000 },
    { month: "Feb", clients: 12, revenue: 18000 },
    { month: "Mar", clients: 18, revenue: 24000 },
    { month: "Apr", clients: 25, revenue: 32000 },
    { month: "May", clients: 32, revenue: 41000 },
    { month: "Jun", clients: total, revenue: 52000 },
  ];

  // Pending documents
  const pendingDocs = clients.reduce(
    (sum, c) =>
      sum +
      c.documents.filter((d) => d.status === "Missing" || d.status === "Pending Review").length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Data-driven insights into your agency performance."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <AnalyticCard
          icon={Target}
          label="Lead Conversion"
          value={`${conversionRate}%`}
          tone="primary"
        />
        <AnalyticCard
          icon={FileCheck}
          label="Visa Approval Rate"
          value={`${visaRate}%`}
          tone="success"
        />
        <AnalyticCard
          icon={Clock}
          label="Avg. Processing"
          value={`${avgDays} days`}
          tone="warning"
        />
        <AnalyticCard icon={Users} label="Total Clients" value={total} tone="primary" />
        <AnalyticCard
          icon={GraduationCap}
          label="Applications"
          value={clients.filter((c) => STAGES.indexOf(c.status) >= 3).length}
          tone="success"
        />
        <AnalyticCard icon={TrendingUp} label="Pending Docs" value={pendingDocs} tone="danger" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="transition hover:shadow-md">
          <SectionTitle>Applications by Country</SectionTitle>
          <div className="h-72">
            {byCountry.length === 0 ? (
              <EmptyHint>No data yet.</EmptyHint>
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
                  <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="transition hover:shadow-md">
          <SectionTitle>Pipeline Distribution</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="stage"
                >
                  {byStage.map((_, i) => (
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
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="transition hover:shadow-md">
          <SectionTitle>Monthly Growth</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  yAxisId={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="transition hover:shadow-md">
          <SectionTitle>Consultant Performance</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={consultantPerf}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#9333EA" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AnalyticCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: string;
}) {
  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="flex flex-col gap-2 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={
            "flex h-8 w-8 items-center justify-center rounded-lg " +
            (toneCls[tone] ?? toneCls.primary)
          }
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
    </Card>
  );
}
