import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useData } from "@/lib/data-provider";
import {
  CONSULTANTS,
  COUNTRIES_FROM,
  DESTINATIONS,
  INTAKES,
  STAGES,
  UNIVERSITIES_LIST,
  type Client,
  type Document,
  type DocStatus,
  type Stage,
  type Task,
  type University,
} from "@/lib/database";

// ============ Form primitives ============
function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground/80">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring";
const textareaCls =
  "min-h-[80px] w-full rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring";

function BtnPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      type="submit"
      className={
        "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50 " +
        className
      }
      {...rest}
    />
  );
}

function BtnGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      type="button"
      className={
        "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary " +
        className
      }
      {...rest}
    />
  );
}

// ============ Client Dialog ============
export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client?: Client;
}) {
  const { createClient, updateClient } = useData();
  const editing = Boolean(client);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: COUNTRIES_FROM[0],
    destination: DESTINATIONS[0],
    program: "",
    intake: INTAKES[0],
    consultant: CONSULTANTS[0],
    notes: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    status: "Lead" as Stage,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: client?.name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        nationality: client?.nationality ?? COUNTRIES_FROM[0],
        destination: client?.destination ?? DESTINATIONS[0],
        program: client?.university ?? "",
        intake: client?.intake ?? INTAKES[0],
        consultant: client?.consultant ?? CONSULTANTS[0],
        notes: client?.notes ?? "",
        priority: client?.priority ?? "Medium",
        status: client?.status ?? "Lead",
      });
    }
  }, [open, client]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing && client) {
        await updateClient(client.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          nationality: form.nationality,
          destination: form.destination,
          university: form.program || undefined,
          intake: form.intake,
          consultant: form.consultant,
          notes: form.notes,
          priority: form.priority,
          status: form.status,
        });
      } else {
        await createClient({ ...form });
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update client information." : "Add a new client to your agency pipeline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Nationality">
            <select
              className={inputCls}
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            >
              {COUNTRIES_FROM.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Destination country">
            <select
              className={inputCls}
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            >
              {DESTINATIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Program / University">
            <input
              className={inputCls}
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="MSc Computer Science"
            />
          </Field>
          <Field label="Intake">
            <select
              className={inputCls}
              value={form.intake}
              onChange={(e) => setForm({ ...form, intake: e.target.value })}
            >
              {INTAKES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Assigned consultant">
            <select
              className={inputCls}
              value={form.consultant}
              onChange={(e) => setForm({ ...form, consultant: e.target.value })}
            >
              {CONSULTANTS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputCls}
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as "Low" | "Medium" | "High" })
              }
            >
              {["Low", "Medium", "High"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Stage">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Stage })}
            >
              {STAGES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                className={textareaCls}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter className="sm:col-span-2 gap-2">
            <BtnGhost onClick={() => onOpenChange(false)}>Cancel</BtnGhost>
            <BtnPrimary disabled={isSubmitting}>
              {editing ? "Save changes" : "Create client"}
            </BtnPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ Confirm Dialog ============
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Delete",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteClientButton({
  clientId,
  onDeleted,
}: {
  clientId: string;
  onDeleted?: () => void;
}) {
  const { deleteClient } = useData();
  const [open, setOpen] = useState(false);
  return (
    <>
      <BtnGhost onClick={() => setOpen(true)} className="text-destructive">
        Delete
      </BtnGhost>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this client?"
        description="This will remove the client and all related documents, tasks and universities. This action cannot be undone."
        onConfirm={async () => {
          await deleteClient(clientId);
          setOpen(false);
          onDeleted?.();
        }}
      />
    </>
  );
}

// ============ University Dialog ============
export function UniversityFormDialog({
  open,
  onOpenChange,
  clientId,
  university,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string;
  university?: University;
}) {
  const { addUniversity, updateUniversity } = useData();
  const editing = Boolean(university);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<Omit<University, "id" | "client_id">>({
    name: "",
    country: DESTINATIONS[0],
    program: "",
    deadline: new Date().toISOString().slice(0, 10),
    status: "Applied",
    scholarship: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: university?.name ?? "",
        country: university?.country ?? DESTINATIONS[0],
        program: university?.program ?? "",
        deadline: university?.deadline ?? new Date().toISOString().slice(0, 10),
        status: university?.status ?? "Applied",
        scholarship: university?.scholarship ?? "",
        notes: university?.notes ?? "",
      });
    }
  }, [open, university]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("University name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing && university) {
        await updateUniversity(university.id, form);
      } else {
        await addUniversity(clientId, form);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save university");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit university" : "Add university"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="University name" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              list="known-unis"
            />
            <datalist id="known-unis">
              {UNIVERSITIES_LIST.map((u) => (
                <option key={u.name} value={u.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Program">
            <input
              className={inputCls}
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <select
              className={inputCls}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              {DESTINATIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input
              type="date"
              className={inputCls}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as University["status"] })}
            >
              {["Applied", "Accepted", "Waiting", "Rejected"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Scholarship">
            <input
              className={inputCls}
              value={form.scholarship ?? ""}
              onChange={(e) => setForm({ ...form, scholarship: e.target.value })}
              placeholder="$8,000 / year"
            />
          </Field>
          <DialogFooter className="sm:col-span-2 gap-2">
            <BtnGhost onClick={() => onOpenChange(false)}>Cancel</BtnGhost>
            <BtnPrimary disabled={isSubmitting}>{editing ? "Save" : "Add"}</BtnPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ Task Dialog ============
export function TaskFormDialog({
  open,
  onOpenChange,
  clientId: presetClientId,
  task,
  clients,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId?: string;
  task?: Task;
  clients: Client[];
}) {
  const { addTask, updateTask } = useData();
  const editing = Boolean(task);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    clientId: presetClientId ?? clients[0]?.id ?? "",
    consultant: CONSULTANTS[0],
    deadline: new Date().toISOString().slice(0, 10),
    priority: "Medium" as "Low" | "Medium" | "High",
    status: "Todo" as "Todo" | "In Progress" | "Done",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: task?.title ?? "",
        clientId: task?.client_id ?? presetClientId ?? clients[0]?.id ?? "",
        consultant: task?.consultant ?? CONSULTANTS[0],
        deadline: task?.deadline ?? new Date().toISOString().slice(0, 10),
        priority: task?.priority ?? "Medium",
        status: task?.status ?? "Todo",
      });
    }
  }, [open, task, presetClientId, clients]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.clientId) {
      toast.error("Pick a client");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing && task) {
        await updateTask(task.id, {
          title: form.title.trim(),
          consultant: form.consultant,
          deadline: form.deadline,
          priority: form.priority,
          status: form.status,
        });
      } else {
        await addTask(form.clientId, {
          title: form.title.trim(),
          consultant: form.consultant,
          deadline: form.deadline,
          priority: form.priority,
          status: form.status,
        });
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title" required>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Client" required>
            <select
              className={inputCls}
              value={form.clientId}
              disabled={editing}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Consultant">
            <select
              className={inputCls}
              value={form.consultant}
              onChange={(e) => setForm({ ...form, consultant: e.target.value })}
            >
              {CONSULTANTS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input
              type="date"
              className={inputCls}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Field>
          <Field label="Priority">
            <select
              className={inputCls}
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as "Low" | "Medium" | "High" })
              }
            >
              {["Low", "Medium", "High"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "Todo" | "In Progress" | "Done" })
              }
            >
              {["Todo", "In Progress", "Done"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <DialogFooter className="sm:col-span-2 gap-2">
            <BtnGhost onClick={() => onOpenChange(false)}>Cancel</BtnGhost>
            <BtnPrimary disabled={isSubmitting}>{editing ? "Save" : "Create"}</BtnPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const { deleteTask } = useData();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-destructive hover:underline">
        Delete
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this task?"
        onConfirm={async () => {
          await deleteTask(taskId);
          setOpen(false);
        }}
      />
    </>
  );
}

export function DeleteUniversityButton({ uniId }: { uniId: string }) {
  const { deleteUniversity } = useData();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-destructive hover:underline">
        Delete
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove this university?"
        onConfirm={async () => {
          await deleteUniversity(uniId);
          setOpen(false);
        }}
      />
    </>
  );
}

// ============ Document Dialog ============
export function DocumentFormDialog({
  open,
  onOpenChange,
  clientId,
  document: doc,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string;
  document?: Document;
}) {
  const { addDocument, updateDocument } = useData();
  const editing = Boolean(doc);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<Omit<Document, "id" | "client_id">>({
    name: "",
    status: "Pending Review",
    uploaded_at: new Date().toISOString().slice(0, 10),
    expires_at: "",
    notes: "",
    category: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: doc?.name ?? "",
        status: doc?.status ?? "Pending Review",
        uploaded_at: doc?.uploaded_at ?? new Date().toISOString().slice(0, 10),
        expires_at: doc?.expires_at ?? "",
        notes: doc?.notes ?? "",
        category: doc?.category ?? "",
      });
    }
  }, [open, doc]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Document name required");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing && doc) {
        await updateDocument(doc.id, form);
      } else {
        await addDocument(clientId, form);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit document" : "Upload document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Document name" required>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DocStatus })}
            >
              {["Missing", "Pending Review", "Approved", "Rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <input
              className={inputCls}
              value={form.category ?? ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Identity, Academic, Financial..."
            />
          </Field>
          <Field label="Uploaded">
            <input
              type="date"
              className={inputCls}
              value={form.uploaded_at ?? ""}
              onChange={(e) => setForm({ ...form, uploaded_at: e.target.value })}
            />
          </Field>
          <Field label="Expires">
            <input
              type="date"
              className={inputCls}
              value={form.expires_at ?? ""}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                className={textareaCls}
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter className="sm:col-span-2 gap-2">
            <BtnGhost onClick={() => onOpenChange(false)}>Cancel</BtnGhost>
            <BtnPrimary disabled={isSubmitting}>{editing ? "Save" : "Upload"}</BtnPrimary>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDocumentButton({ docId }: { docId: string }) {
  const { deleteDocument } = useData();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-destructive hover:underline">
        Delete
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this document?"
        onConfirm={async () => {
          await deleteDocument(docId);
          setOpen(false);
        }}
      />
    </>
  );
}
