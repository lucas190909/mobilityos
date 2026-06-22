import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Card, PageHeader, StatusPill } from "@/components/ui-bits";
import { TEAM } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — MobilityOS" }] }),
  component: TeamPage,
});

const PERMISSIONS: Record<string, string[]> = {
  Administrator: ["Manage agency","Manage team","All clients","Billing","Settings"],
  Consultant: ["Own clients","Documents","Tasks","Calendar"],
  Assistant: ["Tasks","Documents (read)","Calendar"],
};

function TeamPage() {
  return (
    <div>
      <PageHeader title="Team" description="Agency members, roles, and access permissions." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEAM.map(m => (
          <Card key={m.id}>
            <div className="flex items-center gap-3">
              <Avatar src={m.photo} name={m.name} size={48} />
              <div className="min-w-0">
                <div className="truncate font-medium">{m.name}</div>
                <div className="truncate text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="ml-auto"><StatusPill status={m.role} /></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active clients</span>
              <span className="font-medium tabular-nums">{m.clients}</span>
            </div>
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Permissions</div>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSIONS[m.role].map(p => (
                  <span key={p} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground/80">{p}</span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
