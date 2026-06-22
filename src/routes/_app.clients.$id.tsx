import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CircleCheck as CheckCircle2, FileText, GraduationCap, Mail, MapPin, Phone, Plus, Trash2, Clock, MessageSquare, CalendarDays, Activity, Pencil, SquareCheck as CheckSquare, MoveVertical as MoreVertical, ChevronRight, TriangleAlert as AlertTriangle } from "lucide-react";
import {
  Card,
  EmptyHint,
  PageHeader,
  Progress,
  SectionTitle,
  StatusPill,
  Avatar,
} from "@/components/ui-bits";
import {
  ClientFormDialog,
  ConfirmDialog,
  DocumentFormDialog,
  TaskFormDialog,
  UniversityFormDialog,
} from "@/components/dialogs";
import { useData } from "@/lib/data-provider";
import type { Client, Document, Task, University } from "@/lib/database";

export const Route = createFileRoute("/_app/clients/$id")({
  head: () => ({ meta: [{ title: "Client Profile — MobilityOS" }] }),
  component: ClientProfile,
});

const TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "applications", label: "Applications", icon: GraduationCap },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "notes", label: "Notes", icon: MessageSquare },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ClientProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { clients, isLoading, updateClient, deleteClient, setClientStage } = useData();
  const client = clients.find((c) => c.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [uniOpen, setUniOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | undefined>();
  const [editingUni, setEditingUni] = useState<University | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [noteText, setNoteText] = useState("");

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Client Profile" description="Loading…" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div>
        <PageHeader title="Client Profile" description="Client not found." />
        <EmptyHint>
          This client does not exist.{" "}
          <Link to="/clients" className="text-primary hover:underline">
            Back to clients
          </Link>
        </EmptyHint>
      </div>
    );
  }

  const handleDelete = async () => {
    const success = await deleteClient(client.id);
    if (success) {
      setDeleteOpen(false);
      navigate({ to: "/clients" });
    }
  };

  const handleStageChange = async (stage: string) => {
    await setClientStage(client.id, stage as Client["status"]);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await updateClient(client.id, { notes: noteText.trim() });
    setNoteText("");
  };

  const stages = [
    "Lead",
    "Consultation",
    "Documents",
    "Application",
    "Offer Received",
    "Visa",
    "Travel Preparation",
    "Completed",
  ];
  const currentIndex = stages.indexOf(client.status);
  const missingDocs = client.documents.filter((d) => d.status === "Missing").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/clients" })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <Avatar src={client.photo} name={client.name} size={48} />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {client.nationality} → {client.destination} · {client.intake}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <QuickStat label="Status" value={<StatusPill status={client.status} />} />
        <QuickStat label="Priority" value={<StatusPill status={client.priority} />} />
        <QuickStat label="Progress" value={`${client.progress}%`} />
        <QuickStat
          label="Documents"
          value={`${client.documents.length - missingDocs}/${client.documents.length}`}
          warning={missingDocs > 0}
        />
        <QuickStat label="Universities" value={client.universities.length} />
        <QuickStat label="Tasks" value={client.tasks.filter((t) => t.status !== "Done").length} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={
                "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition border-b-2 " +
                (isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && (
          <OverviewTab
            client={client}
            onStageChange={handleStageChange}
            stages={stages}
            currentIndex={currentIndex}
          />
        )}
        {activeTab === "timeline" && <TimelineTab client={client} />}
        {activeTab === "applications" && <ApplicationsTab client={client} />}
        {activeTab === "documents" && (
          <DocumentsTab
            client={client}
            onAdd={() => {
              setEditingDoc(undefined);
              setDocOpen(true);
            }}
            onEdit={(d) => {
              setEditingDoc(d);
              setDocOpen(true);
            }}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            client={client}
            onAdd={() => {
              setEditingTask(undefined);
              setTaskOpen(true);
            }}
            onEdit={(t) => {
              setEditingTask(t);
              setTaskOpen(true);
            }}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab
            client={client}
            noteText={noteText}
            setNoteText={setNoteText}
            onSave={handleSaveNote}
          />
        )}
        {activeTab === "calendar" && <CalendarTab client={client} />}
      </div>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this client?"
        description="This will remove the client and all related documents, tasks and universities. This action cannot be undone."
        onConfirm={handleDelete}
      />
      <DocumentFormDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        clientId={client.id}
        document={editingDoc}
      />
      <UniversityFormDialog
        open={uniOpen}
        onOpenChange={setUniOpen}
        clientId={client.id}
        university={editingUni}
      />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        clientId={client.id}
        task={editingTask}
        clients={clients}
      />
    </div>
  );
}

function QuickStat({
  label,
  value,
  warning,
}: {
  label: string;
  value: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-1 py-3 text-center transition hover:shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={"text-lg font-semibold " + (warning ? "text-destructive" : "")}>{value}</div>
    </Card>
  );
}

function OverviewTab({
  client,
  onStageChange,
  stages,
  currentIndex,
}: {
  client: Client;
  onStageChange: (stage: string) => void;
  stages: string[];
  currentIndex: number;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoField
            icon={Mail}
            label="Email"
            value={client.email}
            href={`mailto:${client.email}`}
          />
          <InfoField icon={Phone} label="Phone" value={client.phone ?? "—"} />
          <InfoField icon={MapPin} label="Destination" value={client.destination ?? "—"} />
          <InfoField icon={Activity} label="Consultant" value={client.consultant ?? "—"} />
          <InfoField icon={Clock} label="Deadline" value={client.deadline ?? "TBD"} />
          <InfoField icon={GraduationCap} label="University" value={client.university ?? "—"} />
          <InfoField
            icon={CheckCircle2}
            label="Visa Status"
            value={<StatusPill status={client.visa_status} />}
          />
          <InfoField
            icon={CheckCircle2}
            label="Essay Reviewed"
            value={client.essay_reviewed ? "Yes" : "No"}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle>Pipeline Progress</SectionTitle>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="font-medium">{client.progress}%</span>
          </div>
          <Progress value={client.progress} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {stages.map((stage, i) => {
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <button
                key={stage}
                onClick={() => onStageChange(stage)}
                className={
                  "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition " +
                  (isCurrent
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : isPast
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80")
                }
              >
                {isPast && <CheckCircle2 className="h-3 w-3" />}
                {stage}
              </button>
            );
          })}
        </div>
      </Card>

      {client.notes && (
        <Card>
          <SectionTitle>Notes</SectionTitle>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {client.notes}
          </p>
        </Card>
      )}
    </div>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-1.5 text-sm">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {href ? (
          <a href={href} className="text-primary hover:underline">
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
}

function TimelineTab({ client }: { client: Client }) {
  return (
    <div>
      <SectionTitle>Activity Timeline</SectionTitle>
      {client.timeline.length === 0 ? (
        <EmptyHint>No timeline events yet.</EmptyHint>
      ) : (
        <div className="relative space-y-4 pl-6 mt-4">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          {client.timeline.map((e) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              <Card className="py-3 transition hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.date}</div>
                  </div>
                  <StatusPill status={e.type} />
                </div>
                {e.description && (
                  <p className="mt-2 text-xs text-muted-foreground">{e.description}</p>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsTab({ client }: { client: Client }) {
  const { updateUniversity } = useData();
  return (
    <div>
      <SectionTitle>University Applications</SectionTitle>
      {client.universities.length === 0 ? (
        <EmptyHint>No university applications yet.</EmptyHint>
      ) : (
        <div className="space-y-3 mt-4">
          {client.universities.map((u) => (
            <Card
              key={u.id}
              className="flex items-center justify-between gap-4 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.program} · {u.country} · Deadline {u.deadline}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={u.status} />
                {u.scholarship && (
                  <span className="text-xs text-muted-foreground">{u.scholarship}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({
  client,
  onAdd,
  onEdit,
}: {
  client: Client;
  onAdd: () => void;
  onEdit: (d: Document) => void;
}) {
  const { setDocumentStatus, deleteDocument } = useData();
  const categories = [
    "Passport",
    "Transcript",
    "Recommendation Letter",
    "Financial Proof",
    "Visa Form",
    "Photo",
    "Insurance",
    "Acceptance Letter",
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Documents</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>
      {client.documents.length === 0 ? (
        <EmptyHint>No documents yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {client.documents.map((d) => (
            <Card
              key={d.id}
              className="flex items-center justify-between gap-4 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.uploaded_at ? `Uploaded ${d.uploaded_at}` : "Not uploaded"}
                    {d.expires_at && ` · Expires ${d.expires_at}`}
                    {d.category && ` · ${d.category}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={d.status} />
                {d.status !== "Approved" && (
                  <button
                    onClick={async () => await setDocumentStatus(d.id, "Approved")}
                    className="text-xs text-success hover:underline transition"
                  >
                    Approve
                  </button>
                )}
                {d.status !== "Rejected" && (
                  <button
                    onClick={async () => await setDocumentStatus(d.id, "Rejected")}
                    className="text-xs text-destructive hover:underline transition"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => onEdit(d)}
                  className="text-xs text-primary hover:underline transition"
                >
                  Edit
                </button>
                <button
                  onClick={async () => await deleteDocument(d.id)}
                  className="text-xs text-destructive hover:underline transition"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksTab({
  client,
  onAdd,
  onEdit,
}: {
  client: Client;
  onAdd: () => void;
  onEdit: (t: Task) => void;
}) {
  const { updateTask, deleteTask } = useData();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Tasks</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>
      {client.tasks.length === 0 ? (
        <EmptyHint>No tasks yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {client.tasks.map((t) => (
            <Card
              key={t.id}
              className="flex items-center justify-between gap-4 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-lg " +
                    (t.status === "Done"
                      ? "bg-success/15 text-success"
                      : "bg-secondary text-muted-foreground")
                  }
                >
                  <CheckSquare className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.consultant} · Due {t.deadline}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={t.priority} />
                <StatusPill status={t.status} />
                {t.status !== "Done" && (
                  <button
                    onClick={async () => await updateTask(t.id, { status: "Done" })}
                    className="text-xs text-success hover:underline transition"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => onEdit(t)}
                  className="text-xs text-primary hover:underline transition"
                >
                  Edit
                </button>
                <button
                  onClick={async () => await deleteTask(t.id)}
                  className="text-xs text-destructive hover:underline transition"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({
  client,
  noteText,
  setNoteText,
  onSave,
}: {
  client: Client;
  noteText: string;
  setNoteText: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Internal Notes</SectionTitle>
        <textarea
          value={noteText || client.notes || ""}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add internal notes about this client…"
          className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Save Notes
          </button>
        </div>
      </Card>
    </div>
  );
}

function CalendarTab({ client }: { client: Client }) {
  const events = [
    ...client.tasks
      .filter((t) => t.deadline)
      .map((t) => ({ date: t.deadline, title: t.title, type: "Task" as const })),
    ...client.universities
      .filter((u) => u.deadline)
      .map((u) => ({ date: u.deadline, title: `${u.name} deadline`, type: "Deadline" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <SectionTitle>Upcoming Events</SectionTitle>
      {events.length === 0 ? (
        <EmptyHint>No upcoming events for this client.</EmptyHint>
      ) : (
        <div className="space-y-2 mt-4">
          {events.map((e, i) => (
            <Card key={i} className="flex items-center justify-between transition hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.date}</div>
                </div>
              </div>
              <StatusPill status={e.type} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
