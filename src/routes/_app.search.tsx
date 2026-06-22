import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { FileText, GraduationCap, Search as SearchIcon, Users, SquareCheck as CheckSquare } from "lucide-react";
import { Card, EmptyHint, PageHeader } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { globalSearch } from "@/lib/database";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Search — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Client: Users,
  Task: CheckSquare,
  University: GraduationCap,
  Document: FileText,
};

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { clients, isLoading } = useData();

  const results = useMemo(() => globalSearch(clients, q), [clients, q]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof results> = {};
    results.forEach((r) => {
      (map[r.type] ||= []).push(r);
    });
    return map;
  }, [results]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Search" description="Loading…" />
        <Card className="h-48 animate-pulse bg-secondary/50" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Search"
        description="Search across clients, tasks, universities and documents."
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => navigate({ search: { q: e.target.value } })}
            placeholder="Type to search…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </Card>

      {!q ? (
        <EmptyHint>Start typing to search across MobilityOS.</EmptyHint>
      ) : results.length === 0 ? (
        <EmptyHint>No results for "{q}".</EmptyHint>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = ICONS[type] ?? SearchIcon;
            return (
              <Card key={type} className="p-0">
                <div className="border-b border-border bg-secondary/40 px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {type}s ({items.length})
                </div>
                <ul className="divide-y divide-border">
                  {items.map((r) => (
                    <li key={r.type + r.id}>
                      <Link
                        to="/clients/$id"
                        params={{ id: r.clientId }}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{r.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
