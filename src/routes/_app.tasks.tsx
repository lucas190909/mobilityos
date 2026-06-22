import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ListFilter as Filter, ArrowUpDown, CircleCheck as CheckCircle2, Pencil, Trash2, CalendarDays, Tag, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyHint, PageHeader, StatusPill, Avatar } from "@/components/ui-bits";
import { TaskFormDialog, ConfirmDialog } from "@/components/dialogs";
import { useData } from "@/lib/data-provider";
import type { Task } from "@/lib/database";

const COLUMNS = ["Todo", "In Progress", "Done"] as const;

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — MobilityOS" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { clients, updateTask, deleteTask, isLoading } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [dragId, setDragId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterConsultant, setFilterConsultant] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const allTasks = clients.flatMap((c) =>
    c.tasks.map((t) => ({ ...t, clientName: c.name, clientPhoto: c.photo })),
  );

  const filteredTasks = allTasks.filter((t) => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterConsultant && t.consultant !== filterConsultant) return false;
    return true;
  });

  const openNew = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const onDrop = async (col: (typeof COLUMNS)[number]) => {
    if (dragId) {
      const t = allTasks.find((x) => x.id === dragId);
      if (t && t.status !== col) {
        await updateTask(dragId, { status: col });
        toast.success(`Moved to ${col}`);
      }
    }
    setDragId(null);
  };

  const consultants = Array.from(new Set(allTasks.map((t) => t.consultant)));

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Tasks" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-96 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Every action your team needs to take, organized by status and priority."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={
                "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition " +
                (showFilters
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-secondary")
              }
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New Task
            </button>
          </div>
        }
      />

      {showFilters && (
        <Card className="mb-4 p-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Consultant:</span>
              <select
                value={filterConsultant}
                onChange={(e) => setFilterConsultant(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                {consultants.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterPriority("");
                setFilterConsultant("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Clear filters
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = filteredTasks.filter((t) => t.status === col);
          return (
            <Card key={col} className="bg-secondary/20 border-border/50">
              <div onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(col)}>
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{col}</h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground border border-border font-medium">
                      {list.length}
                    </span>
                  </div>
                </div>
                {list.length === 0 ? (
                  <EmptyHint>No tasks here.</EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onEdit={() => {
                          setEditing(t);
                          setOpen(true);
                        }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <TaskFormDialog open={open} onOpenChange={setOpen} task={editing} clients={clients} />
    </div>
  );
}

function TaskCard({
  task: t,
  onEdit,
}: {
  task: Task & { clientName: string; clientPhoto: string };
  onEdit: () => void;
}) {
  const { updateTask, deleteTask } = useData();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <li
      draggable
      onDragStart={() => {}}
      onDragEnd={() => {}}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium leading-5">{t.title}</div>
        <div className="flex items-center gap-1">
          <StatusPill status={t.priority} />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Avatar src={t.clientPhoto} name={t.clientName} size={20} />
        <Link
          to="/clients/$id"
          params={{ id: t.client_id }}
          className="truncate hover:text-primary transition"
        >
          {t.clientName}
        </Link>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {t.consultant}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t.deadline}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/50 pt-2">
        {t.status !== "Done" && (
          <button
            onClick={async () => {
              await updateTask(t.id, { status: "Done" });
              toast.success("Task completed");
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10 transition"
            title="Complete"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onEdit}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this task?"
        onConfirm={async () => {
          await deleteTask(t.id);
          setDeleteOpen(false);
        }}
      />
    </li>
  );
}
