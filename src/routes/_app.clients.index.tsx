import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Plus } from "lucide-react";
import { Avatar, Card, PageHeader, Progress, StatusPill } from "@/components/ui-bits";
import { CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clients/")({
  head: () => ({ meta: [{ title: "Clients — MobilityOS" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div>
      <PageHeader
        title="Clients"
        description="Every student and visa client your agency is currently managing."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add client
            </button>
          </>
        }
      />

      <Card className="p-0 overflow-hidden">
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
              {CLIENTS.map(c => (
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
      </Card>
    </div>
  );
}
