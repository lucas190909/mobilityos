import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, FileCheck, ListChecks, Mail, AlertTriangle } from "lucide-react";
import { Avatar, Card, PageHeader, StatusPill } from "@/components/ui-bits";
import { aiSuggestionsFor, CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — MobilityOS" }] }),
  component: AIPage,
});

const ACTIONS = [
  { label: "Summarize profile", icon: FileCheck },
  { label: "Identify missing items", icon: AlertTriangle },
  { label: "Suggest next steps", icon: ListChecks },
  { label: "Generate checklist", icon: ListChecks },
  { label: "Generate email", icon: Mail },
  { label: "Generate reminder", icon: Send },
];

function AIPage() {
  const [selectedId, setSelectedId] = useState(CLIENTS[0].id);
  const [query, setQuery] = useState("");
  const filtered = CLIENTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
  const client = CLIENTS.find(c => c.id === selectedId)!;
  const insights = aiSuggestionsFor(client);
  const missing = client.documents.filter(d => d.status === "Missing");

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="A contextual co-pilot that understands every client journey."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="p-0">
          <div className="border-b border-border p-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="h-9 w-full rounded-md border border-input bg-secondary/50 px-3 text-sm outline-none focus:border-ring focus:bg-background"
            />
          </div>
          <ul className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {filtered.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  className={
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition " +
                    (c.id === selectedId ? "bg-accent text-accent-foreground" : "hover:bg-secondary/60")
                  }
                >
                  <Avatar src={c.photo} name={c.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{c.destination} · {c.status}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <Avatar src={client.photo} name={client.name} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  <StatusPill status={client.status} />
                </div>
                <div className="text-xs text-muted-foreground">{client.nationality} → {client.destination} · {client.intake}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
              {ACTIONS.map(a => (
                <button
                  key={a.label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-background"
                >
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold">Contextual Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.map((s, i) => (
                <li key={i} className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                  {s}
                </li>
              ))}
            </ul>

            {missing.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested next steps</h4>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {missing.map(m => (
                    <li key={m.id}>Request <span className="font-medium">{m.name}</span> from {client.name.split(" ")[0]}.</li>
                  ))}
                  <li>Schedule a 15-min check-in to verify documents.</li>
                  <li>Send pre-deadline reminder 7 days before {client.deadline}.</li>
                </ol>
              </div>
            )}
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2">
              <input
                placeholder={`Ask anything about ${client.name}…`}
                className="h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
              />
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Send className="h-4 w-4" /> Ask
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
