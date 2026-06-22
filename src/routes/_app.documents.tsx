import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { Card, PageHeader, StatusPill } from "@/components/ui-bits";
import { CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — MobilityOS" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const rows = CLIENTS.flatMap(c =>
    c.documents.map(d => ({ ...d, client: c.name, clientId: c.id }))
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Centralized library of every required document, with status and expiry tracking."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Upload className="h-4 w-4" /> Upload
          </button>
        }
      />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Document</th>
                <th className="px-5 py-3 text-left font-medium">Client</th>
                <th className="px-5 py-3 text-left font-medium">Uploaded</th>
                <th className="px-5 py-3 text-left font-medium">Expires</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map(d => (
                <tr key={d.id} className="border-b border-border last:border-0 transition hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link to="/clients/$id" params={{ id: d.clientId }} className="text-primary hover:underline">{d.client}</Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.uploadedAt ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.expiresAt ?? "—"}</td>
                  <td className="px-5 py-3"><StatusPill status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
