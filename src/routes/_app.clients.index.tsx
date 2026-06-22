import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ListFilter as Filter, Grid3x2 as Grid3X3, List, Mail, MoveHorizontal as MoreHorizontal, Phone, Plus, Search, Trash2, X, MapPin, CalendarDays, Tag, Clock } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill, Avatar } from "@/components/ui-bits";
import { ClientFormDialog, ConfirmDialog } from "@/components/dialogs";
import { useData } from "@/lib/data-provider";
import type { Client } from "@/lib/database";

export const Route = createFileRoute("/_app/clients/")({
  head: () => ({ meta: [{ title: "Clients — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    status: typeof s.status === "string" ? s.status : "",
    destination: typeof s.destination === "string" ? s.destination : "",
    consultant: typeof s.consultant === "string" ? s.consultant : "",
    priority: typeof s.priority === "string" ? s.priority : "",
    view: typeof s.view === "string" ? s.view : "table",
    page: typeof s.page === "string" ? parseInt(s.page, 10) || 1 : 1,
    sort: typeof s.sort === "string" ? s.sort : "name",
    dir: typeof s.dir === "string" ? s.dir : "asc",
  }),
  component: ClientsPage,
});

const PAGE_SIZE = 12;

function ClientsPage() {
  const { clients, isLoading, deleteClient } = useData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFilters, setShowFilters] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const q = search.q.toLowerCase().trim();
  const view = search.view || "table";

  const filtered = useMemo(() => {
    let list = [...clients];
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.destination ?? "").toLowerCase().includes(q) ||
          (c.consultant ?? "").toLowerCase().includes(q) ||
          (c.nationality ?? "").toLowerCase().includes(q),
      );
    }
    if (search.status) list = list.filter((c) => c.status === search.status);
    if (search.destination) list = list.filter((c) => c.destination === search.destination);
    if (search.consultant) list = list.filter((c) => c.consultant === search.consultant);
    if (search.priority) list = list.filter((c) => c.priority === search.priority);

    const dir = search.dir === "desc" ? -1 : 1;
    list.sort((a, b) => {
      const av = (a as Record<string, unknown>)[search.sort] as string;
      const bv = (b as Record<string, unknown>)[search.sort] as string;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [
    clients,
    q,
    search.status,
    search.destination,
    search.consultant,
    search.priority,
    search.sort,
    search.dir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const upd = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch, page: 1 }) });

  const toggleSort = (field: string) => {
    if (search.sort === field) {
      navigate({
        search: (prev: typeof search) => ({ ...prev, dir: prev.dir === "asc" ? "desc" : "asc" }),
      });
    } else {
      navigate({ search: (prev: typeof search) => ({ ...prev, sort: field, dir: "asc" }) });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteClient(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const statuses = Array.from(new Set(clients.map((c) => c.status)));
  const destinations = Array.from(new Set(clients.map((c) => c.destination).filter(Boolean)));
  const consultants = Array.from(new Set(clients.map((c) => c.consultant).filter(Boolean)));

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Clients" description="Loading your client portfolio…" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-16 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Search, filter and manage your client portfolio."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-md border border-border bg-secondary/40 p-0.5">
              <button
                onClick={() => upd({ view: "table" })}
                className={
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition " +
                  (view === "table"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => upd({ view: "grid" })}
                className={
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition " +
                  (view === "grid"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setEditingClient(undefined);
                setEditOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New Client
            </button>
          </div>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search.q}
              onChange={(e) => upd({ q: e.target.value })}
              placeholder="Search by name, email, destination, consultant…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={
              "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition " +
              (showFilters
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-secondary")
            }
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Status"
              value={search.status}
              options={statuses}
              onChange={(v) => upd({ status: v })}
            />
            <FilterSelect
              label="Destination"
              value={search.destination}
              options={destinations}
              onChange={(v) => upd({ destination: v })}
            />
            <FilterSelect
              label="Consultant"
              value={search.consultant}
              options={consultants}
              onChange={(v) => upd({ consultant: v })}
            />
            <FilterSelect
              label="Priority"
              value={search.priority}
              options={["Low", "Medium", "High"]}
              onChange={(v) => upd({ priority: v })}
            />
          </div>
        )}
      </Card>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              onEdit={() => {
                setEditingClient(c);
                setEditOpen(true);
              }}
              onDelete={() => {
                setDeleteId(c.id);
                setDeleteOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="p-0">
          {paginated.length === 0 ? (
            <div className="p-6">
              <EmptyHint>No clients match your filters.</EmptyHint>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <ThSort
                        label="Name"
                        field="name"
                        sort={search.sort}
                        dir={search.dir}
                        onToggle={toggleSort}
                      />
                      <ThSort
                        label="Destination"
                        field="destination"
                        sort={search.sort}
                        dir={search.dir}
                        onToggle={toggleSort}
                      />
                      <ThSort
                        label="Stage"
                        field="status"
                        sort={search.sort}
                        dir={search.dir}
                        onToggle={toggleSort}
                      />
                      <ThSort
                        label="Consultant"
                        field="consultant"
                        sort={search.sort}
                        dir={search.dir}
                        onToggle={toggleSort}
                      />
                      <th className="px-5 py-3 text-left font-medium">Contact</th>
                      <th className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={c.photo} name={c.name} size={32} />
                            <Link
                              to="/clients/$id"
                              params={{ id: c.id }}
                              className="font-medium hover:text-primary"
                            >
                              {c.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{c.destination ?? "—"}</td>
                        <td className="px-5 py-3">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{c.consultant ?? "—"}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${c.email}`}
                              className="text-muted-foreground hover:text-primary transition"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                            {c.phone && (
                              <a
                                href={`tel:${c.phone}`}
                                className="text-muted-foreground hover:text-primary transition"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <ActionBtn
                              onClick={() => {
                                setEditingClient(c);
                                setEditOpen(true);
                              }}
                              icon={MoreHorizontal}
                              label="Edit"
                            />
                            <ActionBtn
                              onClick={() => {
                                setDeleteId(c.id);
                                setDeleteOpen(true);
                              }}
                              icon={Trash2}
                              label="Delete"
                              danger
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) =>
                    navigate({ search: (prev: typeof search) => ({ ...prev, page: p }) })
                  }
                />
              )}
            </>
          )}
        </Card>
      )}

      {view === "grid" && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => navigate({ search: (prev: typeof search) => ({ ...prev, page: p }) })}
          />
        </div>
      )}

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={editingClient} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this client?"
        description="This will remove the client and all related documents, tasks and universities. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ClientCard({
  client: c,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const missingDocs = c.documents.filter((d) => d.status === "Missing").length;
  return (
    <Card className="flex flex-col gap-3 transition hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={c.photo} name={c.name} size={40} />
          <div className="min-w-0">
            <Link
              to="/clients/$id"
              params={{ id: c.id }}
              className="text-sm font-semibold hover:text-primary transition"
            >
              {c.name}
            </Link>
            <div className="text-xs text-muted-foreground">{c.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ActionBtn onClick={onEdit} icon={MoreHorizontal} label="Edit" />
          <ActionBtn onClick={onDelete} icon={Trash2} label="Delete" danger />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <StatusPill status={c.status} />
        <StatusPill status={c.priority} />
        {missingDocs > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
            <FileWarning className="h-3 w-3" /> {missingDocs} missing
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> {c.destination ?? "—"}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" /> {c.deadline ?? "TBD"}
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="h-3 w-3" /> {c.consultant ?? "—"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> {c.intake ?? "—"}
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{c.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.max(0, Math.min(100, c.progress))}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function FileWarning(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition " +
        (danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-secondary hover:text-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <span className="text-xs text-muted-foreground">
        {(page - 1) * PAGE_SIZE + 1}–
        {Math.min(page * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)} of {totalPages * PAGE_SIZE}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 text-xs tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ThSort({
  label,
  field,
  sort,
  dir,
  onToggle,
}: {
  label: string;
  field: string;
  sort: string;
  dir: string;
  onToggle: (field: string) => void;
}) {
  const active = sort === field;
  return (
    <th
      className="cursor-pointer px-5 py-3 text-left font-medium hover:text-foreground transition"
      onClick={() => onToggle(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={"h-3 w-3 transition " + (active ? "text-primary" : "text-muted-foreground/50")}
        />
      </span>
    </th>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </label>
  );
}
