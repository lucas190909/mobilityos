import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, FileCheck, ListChecks, Mail, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { aiSuggestionsFor, type Client } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — MobilityOS" }] }),
  component: AIPage,
});

type Message = { role: "user" | "ai"; text: string };

function generateResponse(action: string, client: Client): string {
  const missing = client.documents.filter(d => d.status === "Missing");
  switch (action) {
    case "Summarize profile":
      return `${client.name} is a ${client.nationality} candidate targeting ${client.destination} for ${client.intake}. Currently in the "${client.status}" stage with ${client.progress}% overall progress. ${missing.length} document(s) outstanding. Visa: ${client.visaStatus}.`;
    case "Identify missing items":
      return missing.length
        ? `Missing items for ${client.name}: ${missing.map(m => m.name).join(", ")}.`
        : `${client.name} has no missing documents. ✅`;
    case "Suggest next steps":
      return [
        `1. ${missing.length ? `Collect: ${missing.map(m => m.name).join(", ")}` : "Continue with current stage"}`,
        `2. Confirm intake of ${client.intake}`,
        `3. Schedule follow-up with ${client.consultant}`,
      ].join("\n");
    case "Generate checklist":
      return [
        "□ Passport (valid 6+ months)",
        "□ Academic transcripts",
        "□ English proficiency test",
        "□ Statement of purpose",
        "□ Financial proof",
        "□ Visa application form",
      ].join("\n");
    case "Generate email":
      return `Hi ${client.name.split(" ")[0]},\n\nA quick update on your ${client.destination} application — you're currently in the "${client.status}" phase. ${missing.length ? `To keep things moving, please send across: ${missing.map(m => m.name).join(", ")}.` : "All your documents are in order — great job!"}\n\nLet me know if you have any questions.\n\nBest,\n${client.consultant}`;
    case "Generate reminder":
      return `Reminder for ${client.name}: ${missing.length ? `${missing.length} document(s) still pending.` : "On track."} Next deadline: ${client.deadline ?? "TBD"}.`;
    default:
      return "Done.";
  }
}

const ACTIONS = [
  { label: "Summarize profile", icon: FileCheck },
  { label: "Identify missing items", icon: AlertTriangle },
  { label: "Suggest next steps", icon: ListChecks },
  { label: "Generate checklist", icon: ListChecks },
  { label: "Generate email", icon: Mail },
  { label: "Generate reminder", icon: Send },
];

function AIPage() {
  const clients = useStore(s => s.clients);
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const filtered = clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
  const client = clients.find(c => c.id === selectedId) ?? clients[0];

  if (!client) {
    return (
      <div>
        <PageHeader title="AI Assistant" description="A contextual co-pilot that understands every client journey." />
        <EmptyHint>Add a client to start using the AI assistant.</EmptyHint>
      </div>
    );
  }

  const insights = aiSuggestionsFor(client);
  const missing = client.documents.filter(d => d.status === "Missing");

  const runAction = (action: string) => {
    const response = generateResponse(action, client);
    setMessages(m => [...m, { role: "user", text: action }, { role: "ai", text: response }]);
    toast.success(`${action} generated`);
  };

  const sendInput = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    const response = `Based on ${client.name}'s profile: ${insights[0] ?? "everything looks on track."} (You asked: "${q}")`;
    setMessages(m => [...m, { role: "user", text: q }, { role: "ai", text: response }]);
  };

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
                  onClick={() => {
                    setSelectedId(c.id);
                    setMessages([]);
                  }}
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
                  onClick={() => runAction(a.label)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-background"
                >
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          {messages.length > 0 && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Conversation</h3>
                <button onClick={() => setMessages([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
              <ul className="space-y-2">
                {messages.map((m, i) => (
                  <li
                    key={i}
                    className={
                      "rounded-lg border p-3 text-sm whitespace-pre-wrap " +
                      (m.role === "ai"
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-secondary/40")
                    }
                  >
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.role === "ai" ? "AI" : "You"}
                    </div>
                    {m.text}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold">Contextual Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.length === 0 ? (
                <li className="text-sm text-muted-foreground">No issues detected.</li>
              ) : (
                insights.map((s, i) => (
                  <li key={i} className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                    {s}
                  </li>
                ))
              )}
            </ul>

            {missing.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested next steps</h4>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {missing.map(m => (
                    <li key={m.id}>Request <span className="font-medium">{m.name}</span> from {client.name.split(" ")[0]}.</li>
                  ))}
                  <li>Schedule a 15-min check-in to verify documents.</li>
                  {client.deadline && <li>Send pre-deadline reminder 7 days before {client.deadline}.</li>}
                </ol>
              </div>
            )}
          </Card>

          <Card className="p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={e => {
                e.preventDefault();
                sendInput();
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask anything about ${client.name}…`}
                className="h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm outline-none focus:border-ring focus:bg-background"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Send className="h-4 w-4" /> Ask
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
