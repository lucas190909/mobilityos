import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Upload,
} from "lucide-react";
import { Avatar, Card, Progress, StatusPill } from "@/components/ui-bits";
import { aiSuggestionsFor, CLIENTS, getClient } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clients/$id")({
  head: ({ params }) => {
    const c = getClient(params.id);
    return { meta: [{ title: `${c?.name ?? "Client"} — MobilityOS` }] };
  },
  loader: ({ params }) => {
    const c = getClient(params.id);
    if (!c) throw notFound();
    return c;
  },
  component: ClientProfile,
  notFoundComponent: () => (
    <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
      Client not found.
    </div>
  ),
});

const TABS = [
  "Overview",
  "Timeline",
  "Documents",
  "Universities",
  "Tasks",
  "Notes",
  "Essays",
  "Visa",
  "Activity",
] as const;
type Tab = typeof TABS[number];

function ClientProfile() {
  const { id } = useParams({ from: "/_app/clients/$id" });
  const client = CLIENTS.find(c => c.id === id)!;
  const [tab, setTab] = useState<Tab>("Overview");
  const ai = aiSuggestionsFor(client);

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Clients
      </Link>

      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={client.photo} name={client.name} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">{client.name}</h2>
                <StatusPill status={client.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.nationality} → {client.destination}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {client.intake}</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="text-xs text-muted-foreground">Consultant: <span className="text-foreground font-medium">{client.consultant}</span></div>
            <div className="w-56">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="tabular-nums">{client.progress}%</span>
              </div>
              <Progress value={client.progress} />
            </div>
          </div>
        </div>

        <div className="mt-6 -mb-5 flex gap-1 overflow-x-auto border-t border-border pt-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-md px-3 py-1.5 text-sm transition " +
                (tab === t
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        {tab === "Overview" && <OverviewTab ai={ai} client={client} />}
        {tab === "Timeline" && <TimelineTab client={client} />}
        {tab === "Documents" && <DocumentsTab client={client} />}
        {tab === "Universities" && <UniversitiesTab client={client} />}
        {tab === "Tasks" && <TasksTab client={client} />}
        {tab === "Notes" && (
          <Card><p className="text-sm leading-6 text-foreground/90">{client.notes}</p></Card>
        )}
        {tab === "Essays" && (
          <Card>
            <h3 className="mb-2 text-sm font-semibold">Statement of Purpose</h3>
            <p className="text-sm text-muted-foreground">
              {client.essayReviewed
                ? "Reviewed and approved by the consultant team."
                : "Draft uploaded by client. Awaiting consultant review."}
            </p>
          </Card>
        )}
        {tab === "Visa" && (
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Visa Status</h3>
              <StatusPill status={client.visaStatus} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Track interview dates, biometrics, and final approval here.
            </p>
          </Card>
        )}
        {tab === "Activity" && <TimelineTab client={client} />}
      </div>
    </div>
  );
}

function OverviewTab({ client, ai }: { client: ReturnType<typeof getClient>; ai: string[] }) {
  if (!client) return null;
  const missing = client.documents.filter(d => d.status === "Missing");
  const nextTasks = client.tasks.filter(t => t.status !== "Done").slice(0, 3);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h3 className="mb-3 text-sm font-semibold">Journey Overview</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Stage" value={client.status} />
          <Stat label="Destination" value={client.destination} />
          <Stat label="Intake" value={client.intake} />
          <Stat label="Priority" value={client.priority} />
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Tasks</h4>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {nextTasks.map(t => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm">{t.title}</div>
                  <div className="text-xs text-muted-foreground">Due {t.deadline}</div>
                </div>
                <StatusPill status={t.priority} />
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-primary/[0.04] to-transparent">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">AI Insights</h3>
        </div>
        <ul className="space-y-2.5">
          {ai.map((s, i) => (
            <li key={i} className="rounded-lg border border-border bg-background/60 p-3 text-sm leading-5">
              {s}
            </li>
          ))}
          {ai.length === 0 && (
            <li className="text-sm text-muted-foreground">No issues detected. Everything on track.</li>
          )}
        </ul>

        {missing.length > 0 && (
          <>
            <h4 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Missing Documents</h4>
            <ul className="space-y-1.5">
              {missing.map(m => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span>{m.name}</span>
                  <StatusPill status={m.status} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function TimelineTab({ client }: { client: ReturnType<typeof getClient> }) {
  if (!client) return null;
  return (
    <Card>
      <ol className="relative space-y-6 border-l border-border pl-6">
        {client.timeline.map(e => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{e.title}</span>
              <StatusPill status={e.type} />
            </div>
            <div className="text-xs text-muted-foreground">{e.date}</div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function DocumentsTab({ client }: { client: ReturnType<typeof getClient> }) {
  if (!client) return null;
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Required Documents</h3>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
      </div>
      <ul className="divide-y divide-border">
        {client.documents.map(d => (
          <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">
                  {d.uploadedAt ? `Uploaded ${d.uploadedAt}` : "Not uploaded"}
                  {d.expiresAt ? ` · Expires ${d.expiresAt}` : ""}
                </div>
              </div>
            </div>
            <StatusPill status={d.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function UniversitiesTab({ client }: { client: ReturnType<typeof getClient> }) {
  if (!client) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {client.universities.map(u => (
        <Card key={u.id}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.program} · {u.country}</div>
              </div>
            </div>
            <StatusPill status={u.status} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground">Deadline</div>
              <div className="mt-0.5 font-medium">{u.deadline}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scholarship</div>
              <div className="mt-0.5 font-medium">{u.scholarship ?? "—"}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TasksTab({ client }: { client: ReturnType<typeof getClient> }) {
  if (!client) return null;
  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {client.tasks.map(t => (
          <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div>
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs text-muted-foreground">Assigned to {t.consultant} · Due {t.deadline}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={t.priority} />
              <StatusPill status={t.status} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
