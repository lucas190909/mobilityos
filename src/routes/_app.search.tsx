import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import { FileText, GraduationCap, Search as SearchIcon, Users, SquareCheck as CheckSquare, Mail, ArrowRight } from "lucide-react";
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

const TONE: Record<string, string> = {
  Client: "bg-primary/10 text-primary",
  Task: "bg-warning/15 text-warning-foreground",
  University: "bg-success/15 text-success",
  Document: "bg-secondary text-secondary-foreground",
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

  // Focus search input on mount
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>("[data-search-input]");
    input?.focus();
  }, []);

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
        title="Global Search"
        description="Search across clients, applications, universities, documents and tasks."
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            data-search-input
            autoFocus
            value={q}
            onChange={(e) => navigate({ search: { q: e.target.value } })}
            placeholder="Type to search across MobilityOS…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </Card>

      {!q ? (
        <EmptyHint>
          <div className="space-y-2">
            <div className="text-sm">Start typing to search across MobilityOS</div>
            <div className="text-xs text-muted-foreground">
              Try: client name, university, document type, task title
            </div>
          </div>
        </EmptyHint>
      ) : results.length === 0 ? (
        <EmptyHint>
          <div className="space-y-2">
            <div className="text-sm">No results for "{q}"</div>
            <div className="text-xs text-muted-foreground">Try a different search term</div>
          </div>
        </EmptyHint>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </div>
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = ICONS[type] ?? SearchIcon;
            return (
              <Card key={type} className="p-0 transition hover:shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
                  <span
                    className={
                      "flex h-6 w-6 items-center justify-center rounded-md " +
                      (TONE[type] ?? TONE.Document)
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {type}s ({items.length})
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((r) => (
                    <li key={r.type + r.id}>
                      <Link
                        to="/clients/$id"
                        params={{ id: r.clientId }}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{r.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
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
