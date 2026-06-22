import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ListFilter as Filter, Mail, MoveHorizontal as MoreHorizontal, Phone, Plus, Search, Trash2, X } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
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
    page: typeof s.page === "string" ? parseInt(s.page, 10) || 1 : 1,
    sort: typeof s.sort === "string" ? s.sort : "name",
    dir: typeof s.dir === "string" ? s.dir : "asc",
  }),
  component: ClientsPage,
});

const PAGE_SIZE = 10;

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

  const filtered = useMemo(() => {
    let list = [...clients];
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.destination ?? "").toLowerCase().includes(q) ||
          (c.consultant ?? "").toLowerCase().includes(q),
      );
    }
    if (search.status) list = list.filter((c) => c.status === search.status);
    if (search.destination) list = list.filter((c) => c.destination === search.destination);
    if (search.consultant) list = list.filter((c) => c.consultant === search.consultant);

    const dir = search.dir === "desc" ? -1 : 1;
    list.sort((a, b) => {
      const av = (a as Record<string, unknown>)[search.sort] as string;
      const bv = (b as Record<string, unknown>)[search.sort] as string;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [clients, q, search.status, search.destination, search.consultant, search.sort, search.dir]);

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
        <PageHeader
          title="Clients"
          description="Search, filter and manage your client portfolio."
        />
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
          <button
            onClick={() => {
              setEditingClient(undefined);
              setEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Client
          </button>
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
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          </div>
        )}
      </Card>

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
                        <Link
                          to="/clients/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:text-primary"
                        >
                          {c.name}
                        </Link>
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
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingClient(c);
                              setEditOpen(true);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="Edit"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(c.id);
                              setDeleteOpen(true);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      navigate({ search: (prev: typeof search) => ({ ...prev, page: page - 1 }) })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-xs tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      navigate({ search: (prev: typeof search) => ({ ...prev, page: page + 1 }) })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

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
      className="cursor-pointer px-5 py-3 text-left font-medium hover:text-foreground"
      onClick={() => onToggle(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${active ? "text-primary" : "text-muted-foreground/50"}`}
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
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
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
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </label>
  );
}
