import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, Globe, Mail, Palette, Workflow } from "lucide-react";
import { Card, PageHeader } from "@/components/ui-bits";
import { WORKFLOWS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — MobilityOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Agency, branding, templates, and workflows." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Section icon={Building2} title="Agency Information" />
          <Field label="Agency name" value="Northwind Mobility Group" />
          <Field label="Country" value="Canada" />
          <Field label="Time zone" value="America/Toronto" />
        </Card>

        <Card>
          <Section icon={Palette} title="Branding" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">N</div>
            <div className="text-sm text-muted-foreground">Upload logo, set primary brand color and email signature.</div>
          </div>
          <div className="mt-4 flex gap-2">
            {["#2563EB","#0EA5E9","#16A34A","#F59E0B","#9333EA","#0F172A"].map(c => (
              <span key={c} style={{ background: c }} className="h-7 w-7 rounded-md ring-1 ring-border" />
            ))}
          </div>
        </Card>

        <Card>
          <Section icon={Mail} title="Email Templates" />
          <ul className="divide-y divide-border">
            {["Welcome email","Document request","Deadline reminder","Offer congratulations","Visa appointment"].map(t => (
              <li key={t} className="flex items-center justify-between py-2.5 text-sm">
                <span>{t}</span>
                <button className="text-xs text-primary hover:underline">Edit</button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Section icon={Globe} title="Countries & Application Stages" />
          <div className="flex flex-wrap gap-1.5">
            {["Canada","USA","UK","Germany","Australia","Netherlands","Ireland","France"].map(c => (
              <span key={c} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs">{c}</span>
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
            {WORKFLOWS.map(w => (
              <div key={w.id} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{w.name}</div>
                    <div className="text-xs text-muted-foreground">{w.country}</div>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{w.steps.length} steps</span>
                </div>
                <ol className="space-y-1.5">
                  {w.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                      <span>{s}</span>
                      {i < w.steps.length - 1 && <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground/60" />}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
