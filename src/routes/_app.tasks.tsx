import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { TaskFormDialog, DeleteTaskButton } from "@/components/dialogs";
import type { Task } from "@/lib/database";

const COLUMNS = ["Todo", "In Progress", "Done"] as const;

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — MobilityOS" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { clients, updateTask, isLoading } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [dragId, setDragId] = useState<string | null>(null);

  const allTasks = clients.flatMap((c) => c.tasks.map((t) => ({ ...t, clientName: c.name })));

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
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = allTasks.filter((t) => t.status === col);
          return (
            <Card key={col} className="bg-secondary/30" {...({} as Record<string, unknown>)}>
              <div onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(col)}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{col}</h3>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {list.length}
                  </span>
                </div>
                {list.length === 0 ? (
                  <EmptyHint>No tasks here.</EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <li
                        key={t.id}
                        draggable
                        onDragStart={() => setDragId(t.id)}
                        onDragEnd={() => setDragId(null)}
                        className="cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card p-3 transition hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-5">{t.title}</div>
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
                        <div className="mt-2 flex items-center justify-end gap-3">
                          {t.status !== "Done" && (
                            <button
                              onClick={async () => {
                                await updateTask(t.id, { status: "Done" });
                                toast.success("Task completed");
                              }}
                              className="text-xs text-success hover:underline"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditing(t);
                              setOpen(true);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <DeleteTaskButton taskId={t.id} />
                        </div>
                      </li>
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
