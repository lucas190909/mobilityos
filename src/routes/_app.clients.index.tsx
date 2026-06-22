import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Filter, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Avatar, Card, EmptyHint, PageHeader, Progress, StatusPill } from "@/components/ui-bits";
import { ClientFormDialog } from "@/components/dialogs";
import { useStore } from "@/lib/store";
import { CONSULTANTS, DESTINATIONS, STAGES, type Stage } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clients/")({
  head: () => ({ meta: [{ title: "Clients — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    stage: typeof s.stage === "string" ? s.stage : "",
    destination: typeof s.destination === "string" ? s.destination : "",
    consultant: typeof s.consultant === "string" ? s.consultant : "",
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const clients = useStore(s => s.clients);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(
    Boolean(search.stage || search.destination || search.consultant),
  );

  const q = search.q.toLowerCase();
  const filtered = clients.filter(c => {
    if (q && !`${c.name} ${c.email} ${c.nationality} ${c.destination}`.toLowerCase().includes(q))
      return false;
    if (search.stage && c.status !== search.stage) return false;
    if (search.destination && c.destination !== search.destination) return false;
    if (search.consultant && c.consultant !== search.consultant) return false;
    return true;
  });

  const updateSearch = (patch: Partial<typeof search>) =>
    navigate({ search: prev => ({ ...prev, ...patch }) });

  const clearFilters = () =>
    navigate({ search: { q: "", stage: "", destination: "", consultant: "" } });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Every student and visa client your agency is currently managing."
        actions={
          <>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add client
            </button>
          </>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search.q}
              onChange={e => updateSearch({ q: e.target.value })}
              placeholder="Search by name, email, country…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          {(search.q || search.stage || search.destination || search.consultant) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FilterSelect
              label="Stage"
              value={search.stage}
              onChange={v => updateSearch({ stage: v })}
              options={STAGES}
            />
            <FilterSelect
              label="Destination"
              value={search.destination}
              onChange={v => updateSearch({ destination: v })}
              options={DESTINATIONS}
            />
            <FilterSelect
              label="Consultant"
              value={search.consultant}
              onChange={v => updateSearch({ consultant: v })}
              options={CONSULTANTS}
            />
          </div>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyHint>No clients match your filters.</EmptyHint>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Destination</th>
                  <th className="px-5 py-3 text-left font-medium">Intake</th>
                  <th className="px-5 py-3 text-left font-medium">Stage</th>
                  <th className="px-5 py-3 text-left font-medium">Consultant</th>
                  <th className="px-5 py-3 text-left font-medium w-44">Progress</th>
                  <th className="px-5 py-3 text-left font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="group border-b border-border last:border-0 transition hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <Link to="/clients/$id" params={{ id: c.id }} className="flex items-center gap-3">
                        <Avatar src={c.photo} name={c.name} size={32} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground group-hover:text-primary">{c.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{c.nationality} · {c.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3">{c.destination}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.intake}</td>
                    <td className="px-5 py-3"><StatusPill status={c.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{c.consultant}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={c.progress} />
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusPill status={c.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ClientFormDialog open={open} onOpenChange={setOpen} />
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
  options: readonly string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// Re-export Stage so tree shaker keeps types happy
export type { Stage };
