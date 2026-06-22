import { useSyncExternalStore } from "react";
import {
  buildSeed,
  type Client,
  type Document,
  type DocStatus,
  type Stage,
  type Task,
  type University,
  STAGES,
} from "./mock-data";

const STORAGE_KEY = "mobilityos:v1";

export interface AppState {
  clients: Client[];
}

function loadInitial(): AppState {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch {
      // ignore
    }
  }
  return { clients: buildSeed() };
}

let state: AppState = loadInitial();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function emit() {
  persist();
  listeners.forEach(l => l());
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  emit();
}

export function getState(): AppState {
  return state;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

// ===== ID helpers =====
function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const AVATAR_POOL = Array.from({ length: 70 }, (_, i) => `https://i.pravatar.cc/120?img=${i + 1}`);

// ===== Client CRUD =====
export interface ClientInput {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  destination: string;
  program?: string;
  intake: string;
  consultant: string;
  notes?: string;
  priority?: "Low" | "Medium" | "High";
  status?: Stage;
  progress?: number;
}

export function createClient(input: ClientInput): Client {
  const id = uid("client");
  const stage: Stage = input.status ?? "Lead";
  const newClient: Client = {
    id,
    name: input.name,
    photo: AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
    nationality: input.nationality,
    destination: input.destination,
    intake: input.intake,
    status: stage,
    consultant: input.consultant,
    progress: input.progress ?? Math.min(100, (STAGES.indexOf(stage) + 1) * 12),
    priority: input.priority ?? "Medium",
    university: input.program,
    deadline: undefined,
    email: input.email,
    phone: input.phone,
    documents: [],
    universities: [],
    tasks: [],
    timeline: [
      {
        id: uid("evt"),
        date: new Date().toISOString().slice(0, 10),
        type: "Consultation",
        title: "Client created",
      },
    ],
    notes: input.notes ?? "",
    essayReviewed: false,
    visaStatus: "Not Started",
  };
  setState(s => ({ ...s, clients: [newClient, ...s.clients] }));
  return newClient;
}

export function updateClient(id: string, patch: Partial<Client>) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

export function deleteClient(id: string) {
  setState(s => ({ ...s, clients: s.clients.filter(c => c.id !== id) }));
}

export function setClientStage(id: string, stage: Stage) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c => {
      if (c.id !== id) return c;
      const progress = Math.min(100, Math.max(c.progress, (STAGES.indexOf(stage) + 1) * 12));
      const event = {
        id: uid("evt"),
        date: new Date().toISOString().slice(0, 10),
        type: stage,
        title: `Moved to ${stage}`,
      };
      return { ...c, status: stage, progress, timeline: [...c.timeline, event] };
    }),
  }));
}

// ===== Documents =====
export function addDocument(clientId: string, doc: Omit<Document, "id">): Document {
  const newDoc: Document = { ...doc, id: uid("doc") };
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId ? { ...c, documents: [...c.documents, newDoc] } : c,
    ),
  }));
  return newDoc;
}

export function updateDocument(clientId: string, docId: string, patch: Partial<Document>) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId
        ? { ...c, documents: c.documents.map(d => (d.id === docId ? { ...d, ...patch } : d)) }
        : c,
    ),
  }));
}

export function deleteDocument(clientId: string, docId: string) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId ? { ...c, documents: c.documents.filter(d => d.id !== docId) } : c,
    ),
  }));
}

export function setDocumentStatus(clientId: string, docId: string, status: DocStatus) {
  updateDocument(clientId, docId, { status });
}

// ===== Universities =====
export function addUniversity(clientId: string, u: Omit<University, "id">): University {
  const newU: University = { ...u, id: uid("uni") };
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId ? { ...c, universities: [...c.universities, newU] } : c,
    ),
  }));
  return newU;
}

export function updateUniversity(clientId: string, uId: string, patch: Partial<University>) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId
        ? { ...c, universities: c.universities.map(u => (u.id === uId ? { ...u, ...patch } : u)) }
        : c,
    ),
  }));
}

export function deleteUniversity(clientId: string, uId: string) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c =>
      c.id === clientId ? { ...c, universities: c.universities.filter(u => u.id !== uId) } : c,
    ),
  }));
}

// ===== Tasks =====
export function addTask(clientId: string, t: Omit<Task, "id" | "clientId">): Task {
  const newT: Task = { ...t, id: uid("task"), clientId };
  setState(s => ({
    ...s,
    clients: s.clients.map(c => (c.id === clientId ? { ...c, tasks: [...c.tasks, newT] } : c)),
  }));
  return newT;
}

export function updateTask(taskId: string, patch: Partial<Task>) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c => ({
      ...c,
      tasks: c.tasks.map(t => (t.id === taskId ? { ...t, ...patch } : t)),
    })),
  }));
}

export function deleteTask(taskId: string) {
  setState(s => ({
    ...s,
    clients: s.clients.map(c => ({ ...c, tasks: c.tasks.filter(t => t.id !== taskId) })),
  }));
}

// ===== Derived selectors =====
export function getClient(id: string): Client | undefined {
  return state.clients.find(c => c.id === id);
}

export function selectAllTasks(s: AppState) {
  return s.clients.flatMap(c => c.tasks);
}

export function selectKpis(s: AppState) {
  const clients = s.clients;
  const active = clients.filter(c => c.status !== "Completed" && c.status !== "Lead").length;
  const waitingDocs = clients.filter(c =>
    c.documents.some(d => d.status === "Missing" || d.status === "Pending Review"),
  ).length;
  const today = new Date();
  const horizon = new Date();
  horizon.setMonth(today.getMonth() + 4);
  const deadlines = clients.filter(c => c.deadline && new Date(c.deadline) < horizon).length;
  const submitted = clients.filter(c => STAGES.indexOf(c.status) >= 3).length;
  const visasApproved = clients.filter(
    c => c.visaStatus === "Approved" || c.status === "Completed",
  ).length;
  return { active, waitingDocs, deadlines, submitted, visasApproved, total: clients.length };
}

export function selectApplicationsByCountry(s: AppState) {
  const map = new Map<string, number>();
  s.clients.forEach(c => map.set(c.destination, (map.get(c.destination) ?? 0) + 1));
  return Array.from(map.entries()).map(([country, count]) => ({ country, count }));
}

export function selectClientsByStage(s: AppState) {
  return STAGES.map(stage => ({
    stage,
    count: s.clients.filter(c => c.status === stage).length,
  }));
}

export function selectRecentActivity(s: AppState) {
  return s.clients
    .flatMap(c => c.timeline.map(e => ({ ...e, client: c.name, clientId: c.id })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

export function selectUrgentTasks(s: AppState) {
  return selectAllTasks(s)
    .filter(t => t.priority === "High" && t.status !== "Done")
    .slice(0, 6)
    .map(t => ({ ...t, clientName: s.clients.find(c => c.id === t.clientId)?.name ?? "" }));
}

export interface SearchResult {
  type: "Client" | "Task" | "University" | "Document";
  id: string;
  title: string;
  subtitle: string;
  clientId: string;
}

export function globalSearch(s: AppState, q: string): SearchResult[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const out: SearchResult[] = [];
  for (const c of s.clients) {
    if (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.destination.toLowerCase().includes(query) ||
      c.nationality.toLowerCase().includes(query)
    ) {
      out.push({
        type: "Client",
        id: c.id,
        title: c.name,
        subtitle: `${c.destination} · ${c.status}`,
        clientId: c.id,
      });
    }
    for (const t of c.tasks) {
      if (t.title.toLowerCase().includes(query)) {
        out.push({
          type: "Task",
          id: t.id,
          title: t.title,
          subtitle: `${c.name} · ${t.status}`,
          clientId: c.id,
        });
      }
    }
    for (const u of c.universities) {
      if (
        u.name.toLowerCase().includes(query) ||
        u.program.toLowerCase().includes(query) ||
        u.country.toLowerCase().includes(query)
      ) {
        out.push({
          type: "University",
          id: u.id,
          title: u.name,
          subtitle: `${u.program} · ${c.name}`,
          clientId: c.id,
        });
      }
    }
    for (const d of c.documents) {
      if (d.name.toLowerCase().includes(query)) {
        out.push({
          type: "Document",
          id: d.id,
          title: d.name,
          subtitle: `${c.name} · ${d.status}`,
          clientId: c.id,
        });
      }
    }
  }
  return out.slice(0, 50);
}

export function resetStore() {
  setState(() => ({ clients: buildSeed() }));
}

export { STAGES };
export type { Client, Document, Stage, Task, University, DocStatus };
