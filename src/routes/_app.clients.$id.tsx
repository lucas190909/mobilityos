import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CircleCheck as CheckCircle2, ChevronRight, Clock, FileText, GraduationCap, Mail, MapPin, MoveHorizontal as MoreHorizontal, Phone, Plus, Trash2, X } from "lucide-react";
import {
  Card,
  EmptyHint,
  PageHeader,
  Progress,
  SectionTitle,
  StatusPill,
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
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "universities" | "tasks" | "timeline"
  >("overview");

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

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "documents" as const, label: `Documents (${client.documents.length})` },
    { key: "universities" as const, label: `Universities (${client.universities.length})` },
    { key: "tasks" as const, label: `Tasks (${client.tasks.length})` },
    { key: "timeline" as const, label: "Timeline" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/clients" })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {client.nationality} → {client.destination} · {client.intake}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab client={client} onStageChange={handleStageChange} />
      )}
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
      {activeTab === "universities" && (
        <UniversitiesTab
          client={client}
          onAdd={() => {
            setEditingUni(undefined);
            setUniOpen(true);
          }}
          onEdit={(u) => {
            setEditingUni(u);
            setUniOpen(true);
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
      {activeTab === "timeline" && <TimelineTab client={client} />}

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

function OverviewTab({
  client,
  onStageChange,
}: {
  client: Client;
  onStageChange: (stage: string) => void;
}) {
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

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                {client.email}
              </a>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Phone</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {client.phone ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Destination</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {client.destination ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Consultant</div>
            <div className="mt-1 text-sm font-medium">{client.consultant ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Priority</div>
            <div className="mt-1">
              <StatusPill status={client.priority} />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Deadline</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {client.deadline ?? "TBD"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">University</div>
            <div className="mt-1 text-sm">{client.university ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Visa Status</div>
            <div className="mt-1">
              <StatusPill status={client.visa_status} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Pipeline Progress</SectionTitle>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{client.progress}%</span>
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
                    ? "bg-primary text-primary-foreground border-primary"
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
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
        </Card>
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Documents</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>
      {client.documents.length === 0 ? (
        <EmptyHint>No documents yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {client.documents.map((d) => (
            <Card key={d.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.uploaded_at ? `Uploaded ${d.uploaded_at}` : "Not uploaded"}
                    {d.expires_at && ` · Expires ${d.expires_at}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={d.status} />
                {d.status !== "Approved" && (
                  <button
                    onClick={async () => await setDocumentStatus(d.id, "Approved")}
                    className="text-xs text-success hover:underline"
                  >
                    Approve
                  </button>
                )}
                {d.status !== "Rejected" && (
                  <button
                    onClick={async () => await setDocumentStatus(d.id, "Rejected")}
                    className="text-xs text-destructive hover:underline"
                  >
                    Reject
                  </button>
                )}
                <button onClick={() => onEdit(d)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button
                  onClick={async () => await deleteDocument(d.id)}
                  className="text-xs text-destructive hover:underline"
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

function UniversitiesTab({
  client,
  onAdd,
  onEdit,
}: {
  client: Client;
  onAdd: () => void;
  onEdit: (u: University) => void;
}) {
  const { deleteUniversity } = useData();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Universities</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add University
        </button>
      </div>
      {client.universities.length === 0 ? (
        <EmptyHint>No universities yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {client.universities.map((u) => (
            <Card key={u.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.program} · {u.country} · Deadline {u.deadline}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={u.status} />
                {u.scholarship && (
                  <span className="text-xs text-muted-foreground">{u.scholarship}</span>
                )}
                <button onClick={() => onEdit(u)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button
                  onClick={async () => await deleteUniversity(u.id)}
                  className="text-xs text-destructive hover:underline"
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
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>
      {client.tasks.length === 0 ? (
        <EmptyHint>No tasks yet.</EmptyHint>
      ) : (
        <div className="space-y-2">
          {client.tasks.map((t) => (
            <Card key={t.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {t.consultant} · Due {t.deadline}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={t.priority} />
                <StatusPill status={t.status} />
                {t.status !== "Done" && (
                  <button
                    onClick={async () => await updateTask(t.id, { status: "Done" })}
                    className="text-xs text-success hover:underline"
                  >
                    Complete
                  </button>
                )}
                <button onClick={() => onEdit(t)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button
                  onClick={async () => await deleteTask(t.id)}
                  className="text-xs text-destructive hover:underline"
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

function TimelineTab({ client }: { client: Client }) {
  return (
    <div>
      <SectionTitle>Timeline</SectionTitle>
      {client.timeline.length === 0 ? (
        <EmptyHint>No timeline events yet.</EmptyHint>
      ) : (
        <div className="relative space-y-4 pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          {client.timeline.map((e) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              <Card className="py-3">
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
