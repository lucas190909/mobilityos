import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, FileCheck, ListChecks, Mail, TriangleAlert as AlertTriangle, Loader as Loader2, MessageSquare, CircleCheck as CheckCircle2, BookOpen, Lightbulb, ChevronRight, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { aiSuggestionsFor, type Client } from "@/lib/database";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — MobilityOS" }] }),
  component: AIPage,
});

type Message = {
  role: "user" | "ai";
  text: string;
  confidence?: "high" | "medium" | "low";
  source?: string;
};

function generateResponse(
  action: string,
  client: Client,
): { text: string; confidence: "high" | "medium" | "low"; source: string } {
  const missing = client.documents.filter((d) => d.status === "Missing");
  switch (action) {
    case "Summarize profile":
      return {
        text: `${client.name} is a ${client.nationality} candidate targeting ${client.destination} for ${client.intake}. Currently in the "${client.status}" stage with ${client.progress}% overall progress. ${missing.length} document(s) outstanding. Visa: ${client.visa_status}.`,
        confidence: "high",
        source: "Based on client profile data",
      };
    case "Identify missing items":
      return {
        text: missing.length
          ? `Missing items for ${client.name}: ${missing.map((m) => m.name).join(", ")}.`
          : `${client.name} has no missing documents.`,
        confidence: "high",
        source: "Based on document records",
      };
    case "Suggest next steps":
      return {
        text: [
          `1. ${missing.length ? `Collect: ${missing.map((m) => m.name).join(", ")}` : "Continue with current stage"}`,
          `2. Confirm intake of ${client.intake}`,
          `3. Schedule follow-up with ${client.consultant}`,
        ].join("\n"),
        confidence: "medium",
        source: "Generated from application workflow",
      };
    case "Generate checklist":
      return {
        text: [
          "□ Passport (valid 6+ months)",
          "□ Academic transcripts",
          "□ English proficiency test",
          "□ Statement of purpose",
          "□ Financial proof",
          "□ Visa application form",
        ].join("\n"),
        confidence: "high",
        source: "Standard visa application checklist",
      };
    case "Generate email":
      return {
        text: `Hi ${client.name.split(" ")[0]},\n\nA quick update on your ${client.destination} application — you're currently in the "${client.status}" phase. ${missing.length ? `To keep things moving, please send across: ${missing.map((m) => m.name).join(", ")}.` : "All your documents are in order — great job!"}\n\nLet me know if you have any questions.\n\nBest,\n${client.consultant}`,
        confidence: "medium",
        source: "Generated using client communication templates",
      };
    case "Generate reminder":
      return {
        text: `Reminder for ${client.name}: ${missing.length ? `${missing.length} document(s) still pending.` : "On track."} Next deadline: ${client.deadline ?? "TBD"}.`,
        confidence: "high",
        source: "Based on client deadlines",
      };
    default:
      return { text: "Done.", confidence: "high", source: "General knowledge" };
  }
}

const ACTIONS = [
  { label: "Summarize profile", icon: FileCheck, desc: "Get a quick overview" },
  { label: "Identify missing items", icon: AlertTriangle, desc: "Find what's needed" },
  { label: "Suggest next steps", icon: Lightbulb, desc: "Recommended actions" },
  { label: "Generate checklist", icon: ListChecks, desc: "Create a todo list" },
  { label: "Generate email", icon: Mail, desc: "Draft a message" },
  { label: "Generate reminder", icon: Send, desc: "Set a reminder" },
];

const SUGGESTED_PROMPTS = [
  "Generate a follow-up email",
  "Summarize profile",
  "Explain missing documents",
  "Generate next steps",
  "Prepare visa checklist",
  "Generate reminders",
];

function AIPage() {
  const { clients, isLoading } = useData();
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filtered = clients
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);
  const client = clients.find((c) => c.id === selectedId) ?? clients[0];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="AI Assistant" description="Loading…" />
        <Card className="h-96 animate-pulse bg-secondary/50" />
      </div>
    );
  }

  if (!client) {
    return (
      <div>
        <PageHeader
          title="AI Assistant"
          description="A contextual co-pilot that understands every client journey."
        />
        <EmptyHint>Add a client to start using the AI assistant.</EmptyHint>
      </div>
    );
  }

  const insights = aiSuggestionsFor(client);
  const missing = client.documents.filter((d) => d.status === "Missing");

  const runAction = async (action: string) => {
    setMessages((m) => [...m, { role: "user", text: action }]);
    setIsAiLoading(true);
    try {
      const response = generateResponse(action, client);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: response.text,
          confidence: response.confidence,
          source: response.source,
        },
      ]);
      toast.success(`${action} generated`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendInput = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setIsAiLoading(true);
    try {
      const response = `Based on ${client.name}'s profile: ${insights[0] ?? "everything looks on track."} (You asked: "${q}")`;
      setMessages((m) => [
        ...m,
        { role: "ai", text: response, confidence: "medium", source: "AI analysis of client data" },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="A contextual co-pilot that understands every client journey."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Client Selector */}
        <Card className="p-0 h-fit">
          <div className="border-b border-border p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="h-9 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none transition focus:border-ring focus:bg-background"
            />
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedId(c.id);
                    setMessages([]);
                  }}
                  className={
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition " +
                    (c.id === selectedId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary/60")
                  }
                >
                  <Avatar src={c.photo} name={c.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {c.destination} · {c.status}
                    </div>
                  </div>
                  {c.id === selectedId && <ChevronRight className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Main Content */}
        <div className="flex flex-col gap-4">
          {/* Client Header */}
          <Card className="bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent border-primary/10">
            <div className="flex items-center gap-3">
              <Avatar src={client.photo} name={client.name} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  <StatusPill status={client.status} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {client.nationality} → {client.destination} · {client.intake}
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Interface */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold">Ask AI</h3>
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="mb-4 space-y-3 max-h-80 overflow-y-auto">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      "rounded-lg border p-3 text-sm whitespace-pre-wrap " +
                      (m.role === "ai"
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-secondary/40")
                    }
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {m.role === "ai" ? "AI Assistant" : "You"}
                      </div>
                      {m.confidence && (
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              "inline-flex h-2 w-2 rounded-full " +
                              (m.confidence === "high"
                                ? "bg-success"
                                : m.confidence === "medium"
                                  ? "bg-warning"
                                  : "bg-muted-foreground")
                            }
                          />
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {m.confidence} Confidence
                          </span>
                        </div>
                      )}
                    </div>
                    {m.text}
                    {m.source && (
                      <div className="mt-2 text-[10px] text-muted-foreground italic">
                        {m.source}
                      </div>
                    )}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Prompts */}
            {messages.length === 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => runAction(p)}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left text-xs transition hover:bg-secondary/60 disabled:opacity-50"
                  >
                    <MessageSquare className="h-3 w-3 text-primary" />
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendInput();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${client.name}…`}
                className="h-10 flex-1 rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none transition focus:border-ring focus:bg-background"
              />
              <button
                type="submit"
                disabled={isAiLoading || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => runAction(a.label)}
                disabled={isAiLoading}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2.5 text-left text-sm transition hover:border-primary/40 hover:bg-background hover:shadow-sm disabled:opacity-50"
              >
                <a.icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <div className="font-medium">{a.label}</div>
                  <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Insights */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold">Contextual Insights</h3>
            </div>
            <ul className="space-y-2">
              {insights.length === 0 ? (
                <li className="text-sm text-muted-foreground">No issues detected.</li>
              ) : (
                insights.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                    {s}
                  </li>
                ))
              )}
            </ul>

            {missing.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Suggested next steps
                </h4>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {missing.map((m) => (
                    <li key={m.id}>
                      Request <span className="font-medium">{m.name}</span> from{" "}
                      {client.name.split(" ")[0]}.
                    </li>
                  ))}
                  <li>Schedule a 15-min check-in to verify documents.</li>
                  {client.deadline && (
                    <li>Send pre-deadline reminder 7 days before {client.deadline}.</li>
                  )}
                </ol>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
