import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, Globe, Mail, Palette, Workflow, Users, Shield, Bell, CreditCard, Plug, Cog, Save, CircleCheck as CheckCircle2, X, Pencil } from "lucide-react";
import { Card, PageHeader } from "@/components/ui-bits";
import { WORKFLOWS } from "@/lib/database";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — MobilityOS" }] }),
  component: SettingsPage,
});

type SectionKey =
  | "general"
  | "branding"
  | "email"
  | "automation"
  | "users"
  | "integrations"
  | "billing"
  | "notifications";

const SECTIONS: {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "general", label: "General", icon: Cog },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "email", label: "Email Templates", icon: Mail },
  { key: "automation", label: "Automation", icon: Workflow },
  { key: "users", label: "Users & Roles", icon: Users },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
];

function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("general");
  const [agencyName, setAgencyName] = useState("Northwind Mobility Group");
  const [country, setCountry] = useState("Canada");
  const [timezone, setTimezone] = useState("America/Toronto");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: "et1",
      name: "Welcome email",
      subject: "Welcome to MobilityOS",
      content:
        "Hi {{client_name}},\n\nWelcome to our agency! We're excited to help you with your {{destination}} application.\n\nBest,\n{{consultant_name}}",
    },
    {
      id: "et2",
      name: "Document request",
      subject: "Documents needed for your application",
      content:
        "Hi {{client_name}},\n\nWe need the following documents to proceed with your application:\n{{missing_documents}}\n\nPlease upload them at your earliest convenience.\n\nBest,\n{{consultant_name}}",
    },
    {
      id: "et3",
      name: "Deadline reminder",
      subject: "Upcoming deadline reminder",
      content:
        "Hi {{client_name}},\n\nThis is a friendly reminder that your application deadline is approaching on {{deadline}}.\n\nBest,\n{{consultant_name}}",
    },
    {
      id: "et4",
      name: "Offer congratulations",
      subject: "Congratulations on your offer!",
      content:
        "Hi {{client_name}},\n\nCongratulations! You've received an offer from {{university}}. Let's discuss the next steps.\n\nBest,\n{{consultant_name}}",
    },
    {
      id: "et5",
      name: "Visa appointment",
      subject: "Visa appointment scheduled",
      content:
        "Hi {{client_name}},\n\nYour visa appointment has been scheduled for {{appointment_date}}. Please bring all required documents.\n\nBest,\n{{consultant_name}}",
    },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [saved, setSaved] = useState(false);

  const colors = ["#2563EB", "#0EA5E9", "#16A34A", "#F59E0B", "#9333EA", "#0F172A"];

  const handleSave = () => {
    toast.success("Settings saved successfully");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openTemplate = (template: (typeof emailTemplates)[0]) => {
    setSelectedTemplate(template.id);
    setTemplateContent(template.content);
    setTemplateSubject(template.subject);
  };

  const saveTemplate = () => {
    setEmailTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate
          ? { ...t, content: templateContent, subject: templateSubject }
          : t,
      ),
    );
    toast.success("Template saved");
    setSelectedTemplate(null);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Agency, branding, templates, users, and system configuration."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <Card className="p-0 h-fit">
          <ul className="py-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setActiveSection(s.key)}
                    className={
                      "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition " +
                      (activeSection === s.key
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-foreground/80 hover:bg-secondary/60")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Content */}
        <div className="space-y-4">
          {activeSection === "general" && (
            <Card>
              <Section icon={Building2} title="Agency Information" />
              <div className="space-y-4">
                <FormField label="Agency name" value={agencyName} onChange={setAgencyName} />
                <FormField label="Country" value={country} onChange={setCountry} />
                <FormField label="Time zone" value={timezone} onChange={setTimezone} />
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                  >
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "branding" && (
            <Card>
              <Section icon={Palette} title="Branding" />
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl font-bold text-2xl text-primary-foreground shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {agencyName[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">Primary Brand Color</div>
                  <div className="text-xs text-muted-foreground">
                    Select a color for your agency branding
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPrimaryColor(c);
                      toast.success("Brand color updated");
                    }}
                    style={{ background: c }}
                    className={
                      "h-8 w-8 rounded-lg ring-1 ring-border transition hover:scale-110 " +
                      (c === primaryColor ? "ring-2 ring-primary ring-offset-2" : "")
                    }
                  />
                ))}
              </div>
            </Card>
          )}

          {activeSection === "email" && (
            <Card>
              <Section icon={Mail} title="Email Templates" />
              <div className="divide-y divide-border">
                {emailTemplates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.subject}</div>
                    </div>
                    <button
                      onClick={() => openTemplate(t)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === "automation" && (
            <Card>
              <Section icon={Workflow} title="Workflow Templates" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {WORKFLOWS.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-lg border border-border p-4 transition hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{w.name}</div>
                        <div className="text-xs text-muted-foreground">{w.country}</div>
                      </div>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground font-medium">
                        {w.steps.length} steps
                      </span>
                    </div>
                    <ol className="space-y-1.5">
                      {w.steps.map((s, i) => (
                        <li key={s} className="flex items-center gap-2 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                          {i < w.steps.length - 1 && (
                            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground/60" />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === "users" && (
            <Card>
              <Section icon={Users} title="Users & Roles" />
              <div className="space-y-3">
                {[
                  {
                    name: "Emma Wilson",
                    role: "Administrator",
                    email: "emma@mobilityos.com",
                    active: true,
                  },
                  {
                    name: "James Carter",
                    role: "Consultant",
                    email: "james@mobilityos.com",
                    active: true,
                  },
                  {
                    name: "Priya Singh",
                    role: "Consultant",
                    email: "priya@mobilityos.com",
                    active: true,
                  },
                  {
                    name: "Lukas Meyer",
                    role: "Assistant",
                    email: "lukas@mobilityos.com",
                    active: false,
                  },
                ].map((u) => (
                  <div
                    key={u.email}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={u.role} />
                      <div
                        className={
                          "h-2 w-2 rounded-full " +
                          (u.active ? "bg-success" : "bg-muted-foreground")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card>
              <Section icon={Plug} title="Integrations" />
              <div className="space-y-3">
                {[
                  { name: "Supabase", status: "Connected", type: "Database" },
                  { name: "SendGrid", status: "Not configured", type: "Email" },
                  { name: "Stripe", status: "Not configured", type: "Payments" },
                  { name: "Google Calendar", status: "Not configured", type: "Calendar" },
                ].map((i) => (
                  <div
                    key={i.name}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.type}</div>
                    </div>
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                        (i.status === "Connected"
                          ? "bg-success/15 text-success"
                          : "bg-secondary text-muted-foreground")
                      }
                    >
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === "billing" && (
            <Card>
              <Section icon={CreditCard} title="Billing" />
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="text-sm font-medium">Current Plan: Professional</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    $99/month · Renews on July 15, 2026
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <BillingMetric label="Clients" value="38/100" />
                  <BillingMetric label="Storage" value="2.4/10 GB" />
                  <BillingMetric label="Team" value="4/10" />
                </div>
              </div>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <Section icon={Bell} title="Notification Preferences" />
              <div className="space-y-3">
                {[
                  { label: "New client registered", enabled: true },
                  { label: "Document uploaded", enabled: true },
                  { label: "Application status changed", enabled: true },
                  { label: "Upcoming deadline (7 days)", enabled: true },
                  { label: "Task assigned to me", enabled: true },
                  { label: "Visa approved", enabled: true },
                  { label: "Email sent to client", enabled: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-2">
                    <span className="text-sm">{n.label}</span>
                    <button
                      className={
                        "relative inline-flex h-5 w-9 items-center rounded-full transition " +
                        (n.enabled ? "bg-primary" : "bg-muted")
                      }
                    >
                      <span
                        className={
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition " +
                          (n.enabled ? "translate-x-5" : "translate-x-1")
                        }
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Template Editor Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Template</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Subject</span>
                <input
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">Content</span>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  className="min-h-[200px] rounded-lg border border-input bg-background p-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring font-mono"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
      />
    </label>
  );
}

function BillingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
