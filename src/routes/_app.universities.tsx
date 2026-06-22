import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ListFilter as Filter, GraduationCap, Plus, X, MapPin, CalendarDays, Pencil, Trash2, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { UniversityFormDialog, ConfirmDialog } from "@/components/dialogs";
import { DESTINATIONS } from "@/lib/database";
import type { University } from "@/lib/database";

const STATUSES = ["Applied", "Accepted", "Waiting", "Rejected"] as const;

export const Route = createFileRoute("/_app/universities")({
  head: () => ({ meta: [{ title: "Universities — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    status: typeof s.status === "string" ? s.status : "",
    country: typeof s.country === "string" ? s.country : "",
  }),
  component: UniversitiesPage,
});

function UniversitiesPage() {
  const { clients, isLoading, deleteUniversity } = useData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<University | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rows = clients.flatMap((c) =>
    c.universities.map((u) => ({ ...u, client: c.name, clientId: c.id })),
  );

  const q = search.q.toLowerCase();
  const filtered = rows.filter((r) => {
    if (q && !`${r.name} ${r.program} ${r.country} ${r.client}`.toLowerCase().includes(q))
      return false;
    if (search.status && r.status !== search.status) return false;
    if (search.country && r.country !== search.country) return false;
    return true;
  });

  const acceptedCount = rows.filter((r) => r.status === "Accepted").length;
  const appliedCount = rows.filter((r) => r.status === "Applied").length;
  const waitingCount = rows.filter((r) => r.status === "Waiting").length;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Universities" description="Loading…" />
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
        title="Universities"
        description="Programs, deadlines, scholarships, and decisions across your portfolio."
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
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{acceptedCount}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{appliedCount}</div>
            <div className="text-xs text-muted-foreground">Applied</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{waitingCount}</div>
            <div className="text-xs text-muted-foreground">Waiting</div>
          </div>
        </Card>
      </div>

      <Card className="mb-4 p-3">
        <input
          value={search.q}
          onChange={(e) =>
            navigate({ search: (prev: typeof search) => ({ ...prev, q: e.target.value }) })
          }
          placeholder="Search university, program, country…"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        />
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <select
                value={search.status}
                onChange={(e) =>
                  navigate({
                    search: (prev: typeof search) => ({ ...prev, status: e.target.value }),
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Country:</span>
              <select
                value={search.country}
                onChange={(e) =>
                  navigate({
                    search: (prev: typeof search) => ({ ...prev, country: e.target.value }),
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                {DESTINATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => navigate({ search: { q: "", status: "", country: "" } })}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      <Card className="p-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyHint>No universities found.</EmptyHint>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">University</th>
                  <th className="px-5 py-3 text-left font-medium">Program</th>
                  <th className="px-5 py-3 text-left font-medium">Country</th>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Deadline</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id + r.clientId}
                    className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                          <GraduationCap className="h-4 w-4" />
                        </span>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.program}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {r.country}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to="/clients/$id"
                        params={{ id: r.clientId }}
                        className="text-primary hover:underline transition"
                      >
                        {r.client}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {r.deadline}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(r);
                            setOpen(true);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(r.id);
                            setDeleteOpen(true);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition"
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
        )}
      </Card>

      <UniversityFormDialog open={open} onOpenChange={setOpen} clientId="" university={editing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove this university?"
        onConfirm={async () => {
          if (deleteId) {
            await deleteUniversity(deleteId);
            setDeleteOpen(false);
          }
        }}
      />
    </div>
  );
}
