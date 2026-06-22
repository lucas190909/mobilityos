import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, ListFilter as Filter } from "lucide-react";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { DocumentFormDialog, DeleteDocumentButton } from "@/components/dialogs";
import type { Document } from "@/lib/database";

const STATUSES = ["Missing", "Pending Review", "Approved", "Rejected"] as const;

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    status: typeof s.status === "string" ? s.status : "",
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { clients, isLoading, setDocumentStatus } = useData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFilters, setShowFilters] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | undefined>();
  const [editingClientId, setEditingClientId] = useState("");

  const rows = clients.flatMap((c) =>
    c.documents.map((d) => ({ ...d, client: c.name, clientId: c.id })),
  );

  const q = search.q.toLowerCase();
  const filtered = rows.filter((d) => {
    if (q && !`${d.name} ${d.client}`.toLowerCase().includes(q)) return false;
    if (search.status && d.status !== search.status) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Documents" description="Loading…" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-16 animate-pulse bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Centralized library of every required document, with status and expiry tracking."
        actions={
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        }
      />

      <Card className="mb-4 p-3">
        <input
          value={search.q}
          onChange={(e) =>
            navigate({ search: (prev: typeof search) => ({ ...prev, q: e.target.value }) })
          }
          placeholder="Search document or client…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
        {showFilters && (
          <div className="mt-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <select
                value={search.status}
                onChange={(e) =>
                  navigate({
                    search: (prev: typeof search) => ({ ...prev, status: e.target.value }),
                  })
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Card>

      <Card className="p-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyHint>No documents match your filters.</EmptyHint>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">Document</th>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Uploaded</th>
                  <th className="px-5 py-3 text-left font-medium">Expires</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((d) => (
                  <tr
                    key={d.id + d.clientId}
                    className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to="/clients/$id"
                        params={{ id: d.clientId }}
                        className="text-primary hover:underline"
                      >
                        {d.client}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{d.uploaded_at ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.expires_at ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {d.status !== "Approved" && (
                          <button
                            onClick={async () => {
                              await setDocumentStatus(d.id, "Approved");
                            }}
                            className="text-xs text-success hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        {d.status !== "Rejected" && (
                          <button
                            onClick={async () => {
                              await setDocumentStatus(d.id, "Rejected");
                            }}
                            className="text-xs text-destructive hover:underline"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingDoc(d);
                            setEditingClientId(d.client_id);
                            setDocOpen(true);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <DeleteDocumentButton docId={d.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <DocumentFormDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        clientId={editingClientId || clients[0]?.id || ""}
        document={editingDoc}
      />
    </div>
  );
}
