import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Card, PageHeader, StatusPill } from "@/components/ui-bits";
import { CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/universities")({
  head: () => ({ meta: [{ title: "Universities — MobilityOS" }] }),
  component: UniversitiesPage,
});

function UniversitiesPage() {
  const rows = CLIENTS.flatMap(c =>
    c.universities.map(u => ({ ...u, client: c.name, clientId: c.id, country: u.country }))
  );

  return (
    <div>
      <PageHeader
        title="Universities"
        description="Programs, deadlines, scholarships, and decisions across your portfolio."
      />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">University</th>
                <th className="px-5 py-3 text-left font-medium">Program</th>
                <th className="px-5 py-3 text-left font-medium">Country</th>
                <th className="px-5 py-3 text-left font-medium">Client</th>
                <th className="px-5 py-3 text-left font-medium">Deadline</th>
                <th className="px-5 py-3 text-left font-medium">Scholarship</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 transition hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.program}</td>
                  <td className="px-5 py-3">{r.country}</td>
                  <td className="px-5 py-3">
                    <Link to="/clients/$id" params={{ id: r.clientId }} className="text-primary hover:underline">{r.client}</Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.deadline}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.scholarship ?? "—"}</td>
                  <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
