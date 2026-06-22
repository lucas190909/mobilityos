import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, ListFilter as Filter, Upload, Eye, Download, RotateCcw, Pencil, Trash2, X, FolderOpen, TriangleAlert as AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyHint, PageHeader, StatusPill } from "@/components/ui-bits";
import { useData } from "@/lib/data-provider";
import { DocumentFormDialog, ConfirmDialog } from "@/components/dialogs";
import type { Document } from "@/lib/database";

const CATEGORIES = [
  "Passport",
  "Transcript",
  "Recommendation Letter",
  "Financial Proof",
  "Visa Form",
  "Photo",
  "Insurance",
  "Acceptance Letter",
];
const STATUSES = ["Missing", "Pending Review", "Approved", "Rejected"] as const;

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — MobilityOS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    status: typeof s.status === "string" ? s.status : "",
    category: typeof s.category === "string" ? s.category : "",
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { clients, isLoading, setDocumentStatus, deleteDocument } = useData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFilters, setShowFilters] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | undefined>();
  const [editingClientId, setEditingClientId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    status: string;
    client: string;
  } | null>(null);

  const rows = clients.flatMap((c) =>
    c.documents.map((d) => ({ ...d, client: c.name, clientId: c.id })),
  );

  const q = search.q.toLowerCase();
  const filtered = rows.filter((d) => {
    if (q && !`${d.name} ${d.client} ${d.category ?? ""}`.toLowerCase().includes(q)) return false;
    if (search.status && d.status !== search.status) return false;
    if (search.category && d.category !== search.category) return false;
    return true;
  });

  const missingCount = rows.filter((d) => d.status === "Missing").length;
  const pendingCount = rows.filter((d) => d.status === "Pending Review").length;
  const approvedCount = rows.filter((d) => d.status === "Approved").length;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Documents" description="Loading…" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-secondary/50" />
          ))}
        </div>
        <Card className="h-96 animate-pulse bg-secondary/50" />
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
            className={
              "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition " +
              (showFilters
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-secondary")
            }
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{missingCount}</div>
            <div className="text-xs text-muted-foreground">Missing</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending Review</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 transition hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{approvedCount}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
        </Card>
      </div>

      <Card className="mb-4 p-3">
        <input
          value={search.q}
          onChange={(e) =>
            navigate({ search: (prev: typeof search) => ({ ...prev, q: e.target.value }) })
          }
          placeholder="Search document, client, or category…"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
        />
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <select
                value={search.status}
                onChange={(e) =>
                  navigate({
                    search: (prev: typeof search) => ({ ...prev, status: e.target.value }),
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Category:</span>
              <select
                value={search.category}
                onChange={(e) =>
                  navigate({
                    search: (prev: typeof search) => ({ ...prev, category: e.target.value }),
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => navigate({ search: { q: "", status: "", category: "" } })}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Clear filters
            </button>
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
                  <th className="px-5 py-3 text-left font-medium">Category</th>
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
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {d.category ? (
                        <span className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs">
                          {d.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to="/clients/$id"
                        params={{ id: d.clientId }}
                        className="text-primary hover:underline transition"
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
                      <div className="flex items-center justify-end gap-1">
                        <ActionBtn
                          icon={Eye}
                          label="Preview"
                          onClick={() =>
                            setPreviewDoc({ name: d.name, status: d.status, client: d.client })
                          }
                        />
                        {d.status !== "Approved" && (
                          <ActionBtn
                            icon={CheckCircle2}
                            label="Approve"
                            onClick={async () => await setDocumentStatus(d.id, "Approved")}
                            success
                          />
                        )}
                        {d.status !== "Rejected" && (
                          <ActionBtn
                            icon={X}
                            label="Reject"
                            onClick={async () => await setDocumentStatus(d.id, "Rejected")}
                            danger
                          />
                        )}
                        <ActionBtn
                          icon={Pencil}
                          label="Edit"
                          onClick={() => {
                            setEditingDoc(d);
                            setEditingClientId(d.client_id);
                            setDocOpen(true);
                          }}
                        />
                        <ActionBtn
                          icon={Trash2}
                          label="Delete"
                          onClick={() => {
                            setDeleteId(d.id);
                            setDeleteOpen(true);
                          }}
                          danger
                        />
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
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this document?"
        onConfirm={async () => {
          if (deleteId) {
            await deleteDocument(deleteId);
            setDeleteOpen(false);
          }
        }}
      />

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{previewDoc.name}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Document preview not available
                </div>
                <div className="text-xs text-muted-foreground">
                  This is a demo — file upload would show here
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span> {previewDoc.client}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <StatusPill status={previewDoc.status} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success("Download started");
                  setPreviewDoc(null);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  success,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  success?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition " +
        (danger
          ? "text-destructive hover:bg-destructive/10"
          : success
            ? "text-success hover:bg-success/10"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
