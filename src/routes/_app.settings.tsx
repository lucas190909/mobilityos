import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, Globe, Mail, Palette, Workflow } from "lucide-react";
import { Card, PageHeader } from "@/components/ui-bits";
import { WORKFLOWS } from "@/lib/database";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — MobilityOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [agencyName, setAgencyName] = useState("Northwind Mobility Group");
  const [country, setCountry] = useState("Canada");
  const [timezone, setTimezone] = useState("America/Toronto");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [emailTemplates, setEmailTemplates] = useState([
    "Welcome email",
    "Document request",
    "Deadline reminder",
    "Offer congratulations",
    "Visa appointment",
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState("");

  const colors = ["#2563EB", "#0EA5E9", "#16A34A", "#F59E0B", "#9333EA", "#0F172A"];

  const handleSave = () => {
    toast.success("Settings saved");
  };

  const openTemplate = (name: string) => {
    setSelectedTemplate(name);
    setTemplateContent(
      `Subject: ${name}\n\nDear {{client_name}},\n\n[Your ${name.toLowerCase()} content here...]\n\nBest regards,\n{{consultant_name}}`,
    );
  };

  const saveTemplate = () => {
    toast.success(`${selectedTemplate} template saved`);
    setSelectedTemplate(null);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Agency, branding, templates, and workflows." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Section icon={Building2} title="Agency Information" />
          <Field label="Agency name" value={agencyName} onChange={setAgencyName} />
          <Field label="Country" value={country} onChange={setCountry} />
          <Field label="Time zone" value={timezone} onChange={setTimezone} />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Save
            </button>
          </div>
        </Card>

        <Card>
          <Section icon={Palette} title="Branding" />
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg font-bold text-primary-foreground"
              style={{ backgroundColor: primaryColor }}
            >
              {agencyName[0]}
            </div>
            <div className="text-sm text-muted-foreground">
              Select a primary brand color for the agency.
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setPrimaryColor(c);
                  toast.success("Brand color updated");
                }}
                style={{ background: c }}
                className={
                  "h-7 w-7 rounded-md ring-1 ring-border transition " +
                  (c === primaryColor ? "ring-2 ring-primary ring-offset-2" : "")
                }
              />
            ))}
          </div>
        </Card>

        <Card>
          <Section icon={Mail} title="Email Templates" />
          <ul className="divide-y divide-border">
            {emailTemplates.map((t) => (
              <li key={t} className="flex items-center justify-between py-2.5 text-sm">
                <span>{t}</span>
                <button
                  onClick={() => openTemplate(t)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Section icon={Globe} title="Countries & Application Stages" />
          <div className="flex flex-wrap gap-1.5">
            {[
              "Canada",
              "USA",
              "UK",
              "Germany",
              "Australia",
              "Netherlands",
              "Ireland",
              "France",
            ].map((c) => (
              <span
                key={c}
                className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Customize the pipeline stages used in your applications board.
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Section icon={Workflow} title="Workflow Templates" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {WORKFLOWS.map((w) => (
              <div key={w.id} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{w.name}</div>
                    <div className="text-xs text-muted-foreground">{w.country}</div>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
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
      </div>

      {/* Template Editor Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Edit {selectedTemplate}</h3>
            <textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              className="mt-4 min-h-[200px] w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Save
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
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-4 h-8 rounded-md border border-input bg-background px-2 text-sm text-right outline-none focus:border-ring focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
