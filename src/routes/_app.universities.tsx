import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, GraduationCap, X } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { DESTINATIONS } from "@/lib/mock-data";

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
  const clients = useStore(s => s.clients);
  const search = Route.useSearch();
  const [showFilters, setShowFilters] = useState(false);

  const rows = clients.flatMap(c =>
    c.universities.map(u => ({ ...u, client: c.name, clientId: c.id })),
  );

  const q = search.q.toLowerCase();
  const filtered = rows.filter(r => {
    if (q && !`${r.name} ${r.program} ${r.country} ${r.client}`.toLowerCase().includes(q)) return false;
    if (search.status && r.status !== search.status) return false;
    if (search.country && r.country !== search.country) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Universities"
        description="Programs, deadlines, scholarships, and decisions across your portfolio."
        actions={
          <button
            onClick={() => setShowFilters(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        }
      />

      <Card className="mb-4 p-3">
        <input
          value={search.q}
          onChange={e =>
            Route.useNavigate
              ? null
              : null
          }
          placeholder="Search university, program, country…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          onInput={(e) => {
            const v = (e.target as HTMLInputElement).value;
            window.history.replaceState(null, "", `?q=${encodeURIComponent(v)}${search.status ? `&status=${search.status}` : ""}${search.country ? `&country=${search.country}` : ""}`);
            // force re-render via custom event
            window.dispatchEvent(new Event("popstate"));
          }}
        />
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Status"
              value={search.status}
              options={[...STATUSES]}
              onChange={v => {
                window.history.replaceState(null, "", `?q=${encodeURIComponent(search.q)}${v ? `&status=${v}` : ""}${search.country ? `&country=${search.country}` : ""}`);
                window.dispatchEvent(new Event("popstate"));
              }}
            />
            <FilterSelect
              label="Country"
              value={search.country}
              options={DESTINATIONS}
              onChange={v => {
                window.history.replaceState(null, "", `?q=${encodeURIComponent(search.q)}${search.status ? `&status=${search.status}` : ""}${v ? `&country=${v}` : ""}`);
                window.dispatchEvent(new Event("popstate"));
              }}
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
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 transition hover:bg-secondary/30">
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
                      <Link to="/clients/$id" params={{ id: r.clientId }} className="text-primary hover:underline">{r.client}</Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.deadline}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.scholarship ?? "—"}</td>
                    <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">All</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {value && (
          <button onClick={() => onChange("")} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </label>
  );
}
