import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ListFilter as Filter, GraduationCap, Plus, X } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { UniversityFormDialog, DeleteUniversityButton } from "@/components/dialogs";
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
  const { clients, isLoading } = useData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<University | undefined>();

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

  const upd = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  const openNew = () => {
    setEditing(undefined);
    setOpen(true);
  };

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
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        }
      />

      <Card className="mb-4 p-3">
        <input
          value={search.q}
          onChange={(e) => upd({ q: e.target.value })}
          placeholder="Search university, program, country…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Status"
              value={search.status}
              options={[...STATUSES]}
              onChange={(v) => upd({ status: v })}
            />
            <FilterSelect
              label="Country"
              value={search.country}
              options={DESTINATIONS}
              onChange={(v) => upd({ country: v })}
            />
          </div>
        )}
      </Card>

      <Card className="p-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyHint>No universities found. Add one from a client profile.</EmptyHint>
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
                  <th className="px-5 py-3 text-left font-medium">Scholarship</th>
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <GraduationCap className="h-4 w-4" />
                        </span>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.program}</td>
                    <td className="px-5 py-3">{r.country}</td>
                    <td className="px-5 py-3">
                      <Link
                        to="/clients/$id"
                        params={{ id: r.clientId }}
                        className="text-primary hover:underline"
                      >
                        {r.client}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.deadline}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.scholarship ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(r);
                            setOpen(true);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <DeleteUniversityButton uniId={r.id} />
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
    </div>
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
