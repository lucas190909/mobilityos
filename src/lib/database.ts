import { supabase } from "./supabase";

export type Stage =
  | "Lead"
  | "Consultation"
  | "Documents"
  | "Application"
  | "Offer Received"
  | "Visa"
  | "Travel Preparation"
  | "Completed";

export const STAGES: Stage[] = [
  "Lead",
  "Consultation",
  "Documents",
  "Application",
  "Offer Received",
  "Visa",
  "Travel Preparation",
  "Completed",
];

export type DocStatus = "Missing" | "Pending Review" | "Approved" | "Rejected";

export interface Document {
  id: string;
  client_id: string;
  name: string;
  status: DocStatus;
  uploaded_at?: string;
  expires_at?: string;
  notes?: string;
  category?: string;
}

export interface University {
  id: string;
  client_id: string;
  name: string;
  country: string;
  program: string;
  deadline: string;
  status: "Applied" | "Accepted" | "Rejected" | "Waiting";
  scholarship?: string;
  notes?: string;
}

export interface Task {
  id: string;
  client_id: string;
  title: string;
  consultant: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "In Progress" | "Done";
}

export interface TimelineEvent {
  id: string;
  client_id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  client_id?: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone?: string;
  nationality?: string;
  destination?: string;
  intake?: string;
  status: Stage;
  consultant?: string;
  progress: number;
  priority: "Low" | "Medium" | "High";
  university?: string;
  deadline?: string;
  notes?: string;
  essay_reviewed: boolean;
  visa_status: "Not Started" | "In Progress" | "Approved" | "Denied";
  created_at: string;
  updated_at: string;
  documents: Document[];
  universities: University[];
  tasks: Task[];
  timeline: TimelineEvent[];
}

export interface ClientInput {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  destination?: string;
  program?: string;
  intake?: string;
  consultant?: string;
  notes?: string;
  priority?: "Low" | "Medium" | "High";
  status?: Stage;
}

// ===== Seed data constants =====
export const COUNTRIES_FROM = [
  "India",
  "Brazil",
  "China",
  "Nigeria",
  "Japan",
  "Italy",
  "Mexico",
  "France",
  "Turkey",
  "Vietnam",
];
export const DESTINATIONS = [
  "Canada",
  "USA",
  "UK",
  "Germany",
  "Australia",
  "Netherlands",
  "Ireland",
  "France",
];
export const INTAKES = ["Fall 2026", "Spring 2027", "Fall 2027"];
export const CONSULTANTS = ["Emma Wilson", "James Carter", "Priya Singh", "Lukas Meyer"];
export const UNIVERSITIES_LIST = [
  { name: "University of Toronto", country: "Canada", program: "MSc Computer Science" },
  { name: "NYU Stern", country: "USA", program: "MBA" },
  { name: "Imperial College London", country: "UK", program: "MSc Data Science" },
  { name: "TU Munich", country: "Germany", program: "MSc Mechanical Eng." },
  { name: "University of Melbourne", country: "Australia", program: "BBA" },
  { name: "TU Delft", country: "Netherlands", program: "MSc Aerospace" },
  { name: "Trinity College Dublin", country: "Ireland", program: "MSc Finance" },
  { name: "Sciences Po", country: "France", program: "MA Public Affairs" },
];

const AVATAR_POOL = Array.from({ length: 70 }, (_, i) => `https://i.pravatar.cc/120?img=${i + 1}`);

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const NAMES = [
  "Aarav Sharma",
  "Sofia Martinez",
  "Liam Chen",
  "Amelia Okafor",
  "Noah Tanaka",
  "Isabella Rossi",
  "Mateo Silva",
  "Olivia Dubois",
  "Yusuf Demir",
  "Mei Wang",
  "Carlos Mendoza",
  "Priya Patel",
  "Ethan Kim",
  "Layla Hassan",
  "Lucas Becker",
  "Zara Ahmed",
  "Diego Rivera",
  "Nora Lindqvist",
  "Hiro Yamada",
  "Anaya Iyer",
];

const DOC_TEMPLATE: Omit<Document, "id" | "client_id">[] = [
  { name: "Passport", status: "Approved", uploaded_at: "2026-02-12", expires_at: "2029-08-01" },
  { name: "Transcript", status: "Approved", uploaded_at: "2026-02-20" },
  { name: "Diploma", status: "Pending Review", uploaded_at: "2026-03-02" },
  { name: "Recommendation Letter", status: "Missing" },
  { name: "English Test (IELTS)", status: "Approved", uploaded_at: "2026-01-30" },
  { name: "CV / Resume", status: "Approved", uploaded_at: "2026-02-05" },
  { name: "Statement of Purpose", status: "Pending Review", uploaded_at: "2026-03-10" },
  { name: "Financial Proof", status: "Missing" },
  { name: "Passport Photo", status: "Approved", uploaded_at: "2026-02-12" },
  { name: "Visa Application Form", status: "Missing" },
];

export const TEAM = [
  {
    id: "u1",
    name: "Emma Wilson",
    role: "Administrator",
    email: "emma@mobilityos.com",
    photo: "https://i.pravatar.cc/100?img=47",
    clients: 12,
  },
  {
    id: "u2",
    name: "James Carter",
    role: "Consultant",
    email: "james@mobilityos.com",
    photo: "https://i.pravatar.cc/100?img=12",
    clients: 9,
  },
  {
    id: "u3",
    name: "Priya Singh",
    role: "Consultant",
    email: "priya@mobilityos.com",
    photo: "https://i.pravatar.cc/100?img=32",
    clients: 11,
  },
  {
    id: "u4",
    name: "Lukas Meyer",
    role: "Assistant",
    email: "lukas@mobilityos.com",
    photo: "https://i.pravatar.cc/100?img=15",
    clients: 5,
  },
];

export const WORKFLOWS = [
  {
    id: "wf1",
    name: "Canada Student",
    country: "Canada",
    steps: [
      "Consultation",
      "Documents",
      "IELTS",
      "College Application",
      "Offer Letter",
      "Study Permit",
      "Accommodation",
      "Flight",
    ],
  },
  {
    id: "wf2",
    name: "USA Undergraduate",
    country: "USA",
    steps: ["Consultation", "SAT", "Common App", "Acceptance", "I-20", "F1 Visa", "Travel"],
  },
  {
    id: "wf3",
    name: "UK Master's",
    country: "UK",
    steps: [
      "Consultation",
      "IELTS",
      "UCAS Application",
      "Conditional Offer",
      "CAS Letter",
      "Tier 4 Visa",
      "Accommodation",
      "Flight",
    ],
  },
];

export function buildSeedClients(): Omit<
  Client,
  "documents" | "universities" | "tasks" | "timeline"
>[] {
  return NAMES.map((name, i) => {
    const stage = STAGES[i % STAGES.length];
    const progress = Math.min(100, (STAGES.indexOf(stage) + 1) * 12 + (i % 5));
    const destination = pick(DESTINATIONS, i);
    const uni =
      UNIVERSITIES_LIST.find((u) => u.country === destination) ??
      UNIVERSITIES_LIST[i % UNIVERSITIES_LIST.length];
    return {
      id: uid("client"),
      name,
      photo: AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
      phone: `+1 555 0${100 + i}`,
      nationality: pick(COUNTRIES_FROM, i),
      destination,
      intake: pick(INTAKES, i),
      status: stage,
      consultant: pick(CONSULTANTS, i),
      progress,
      priority: (["Low", "Medium", "High"] as const)[i % 3],
      university: uni.name,
      deadline: `2026-${String((i % 9) + 3).padStart(2, "0")}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
      notes:
        "Strong academic profile. Prefers cities with good public transport. Family is supportive of relocation.",
      essay_reviewed: i % 3 !== 0,
      visa_status: STAGES.indexOf(stage) >= 5 ? "In Progress" : "Not Started",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

export function buildSeedDocuments(clientId: string, i: number): Omit<Document, "id">[] {
  const docs = DOC_TEMPLATE.map((d) => ({ ...d, client_id: clientId }));
  if (i % 3 === 0) docs[3].status = "Approved";
  if (i % 4 === 0) docs[7].status = "Pending Review";
  return docs;
}

export function buildSeedUniversities(clientId: string, i: number): Omit<University, "id">[] {
  const destination = pick(DESTINATIONS, i);
  const uni =
    UNIVERSITIES_LIST.find((u) => u.country === destination) ??
    UNIVERSITIES_LIST[i % UNIVERSITIES_LIST.length];
  return [
    {
      client_id: clientId,
      name: uni.name,
      country: uni.country,
      program: uni.program,
      deadline: "2026-09-15",
      status: i % 4 === 0 ? "Accepted" : "Applied",
      scholarship: i % 3 === 0 ? "$8,000 / year" : undefined,
      notes: undefined,
    },
    {
      client_id: clientId,
      name: UNIVERSITIES_LIST[(i + 2) % UNIVERSITIES_LIST.length].name,
      country: UNIVERSITIES_LIST[(i + 2) % UNIVERSITIES_LIST.length].country,
      program: UNIVERSITIES_LIST[(i + 2) % UNIVERSITIES_LIST.length].program,
      deadline: "2026-11-01",
      status: "Waiting",
      notes: undefined,
    },
  ];
}

export function buildSeedTasks(clientId: string, i: number): Omit<Task, "id">[] {
  return [
    {
      client_id: clientId,
      title: "Request official transcript",
      consultant: pick(CONSULTANTS, i),
      deadline: "2026-04-12",
      priority: "High",
      status: "In Progress",
    },
    {
      client_id: clientId,
      title: "Review statement of purpose",
      consultant: pick(CONSULTANTS, i + 1),
      deadline: "2026-04-20",
      priority: "Medium",
      status: "Todo",
    },
    {
      client_id: clientId,
      title: "Book visa appointment",
      consultant: pick(CONSULTANTS, i + 2),
      deadline: "2026-05-02",
      priority: "High",
      status: "Todo",
    },
  ];
}

export function buildSeedTimeline(
  clientId: string,
  i: number,
  uniName: string,
  stage: Stage,
): Omit<TimelineEvent, "id">[] {
  const events: Omit<TimelineEvent, "id">[] = [
    {
      client_id: clientId,
      date: "2026-01-10",
      type: "Consultation",
      title: "Initial consultation completed",
    },
    {
      client_id: clientId,
      date: "2026-02-12",
      type: "Documents",
      title: "Passport and photo uploaded",
    },
    {
      client_id: clientId,
      date: "2026-02-28",
      type: "English Test",
      title: "IELTS results received (7.5)",
    },
    {
      client_id: clientId,
      date: "2026-03-15",
      type: "Application",
      title: `Application submitted to ${uniName}`,
    },
  ];
  if (STAGES.indexOf(stage) >= 4) {
    events.push({
      client_id: clientId,
      date: "2026-04-05",
      type: "Offer",
      title: `Offer received from ${uniName}`,
    });
  }
  if (STAGES.indexOf(stage) >= 5) {
    events.push({
      client_id: clientId,
      date: "2026-05-10",
      type: "Visa",
      title: "Visa interview scheduled",
    });
  }
  return events;
}

export async function seedDatabase() {
  const { data: existing } = await supabase.from("clients").select("id").limit(1);
  if (existing && existing.length > 0) return;

  const clients = buildSeedClients();
  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .insert({
        name: c.name,
        email: c.email,
        phone: c.phone,
        nationality: c.nationality,
        destination: c.destination,
        intake: c.intake,
        status: c.status,
        consultant: c.consultant,
        progress: c.progress,
        priority: c.priority,
        university: c.university,
        deadline: c.deadline,
        notes: c.notes,
        essay_reviewed: c.essay_reviewed,
        visa_status: c.visa_status,
        photo: c.photo,
      })
      .select()
      .single();

    if (clientError || !clientData) {
      console.error("Seed client error:", clientError);
      continue;
    }

    const clientId = clientData.id;

    const docs = buildSeedDocuments(clientId, i);
    await supabase.from("documents").insert(docs);

    const unis = buildSeedUniversities(clientId, i);
    await supabase.from("universities").insert(unis);

    const tasks = buildSeedTasks(clientId, i);
    await supabase.from("tasks").insert(tasks);

    const timeline = buildSeedTimeline(clientId, i, c.university ?? "", c.status);
    await supabase.from("timeline_events").insert(timeline);
  }
}

// ===== Client CRUD =====
export async function createClient(input: ClientInput): Promise<Client | null> {
  const stage: Stage = input.status ?? "Lead";
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      nationality: input.nationality,
      destination: input.destination,
      intake: input.intake,
      consultant: input.consultant,
      priority: input.priority ?? "Medium",
      status: stage,
      progress: Math.min(100, (STAGES.indexOf(stage) + 1) * 12),
      university: input.program,
      notes: input.notes,
      photo: `https://i.pravatar.cc/120?img=${Math.floor(Math.random() * 70) + 1}`,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("createClient error:", error);
    return null;
  }

  await supabase.from("timeline_events").insert({
    client_id: data.id,
    date: new Date().toISOString().slice(0, 10),
    type: "Consultation",
    title: "Client created",
  });

  return fetchClientById(data.id);
}

export async function updateClient(
  id: string,
  patch: Partial<ClientInput>,
): Promise<Client | null> {
  const { error } = await supabase.from("clients").update(patch).eq("id", id);
  if (error) {
    console.error("updateClient error:", error);
    return null;
  }
  return fetchClientById(id);
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("deleteClient error:", error);
    return false;
  }
  return true;
}

export async function setClientStage(id: string, stage: Stage): Promise<Client | null> {
  const client = await fetchClientById(id);
  if (!client) return null;
  const progress = Math.min(100, Math.max(client.progress, (STAGES.indexOf(stage) + 1) * 12));

  const { error } = await supabase.from("clients").update({ status: stage, progress }).eq("id", id);

  if (error) {
    console.error("setClientStage error:", error);
    return null;
  }

  await supabase.from("timeline_events").insert({
    client_id: id,
    date: new Date().toISOString().slice(0, 10),
    type: stage,
    title: `Moved to ${stage}`,
  });

  return fetchClientById(id);
}

// ===== Document CRUD =====
export async function addDocument(
  clientId: string,
  doc: Omit<Document, "id" | "client_id">,
): Promise<Document | null> {
  const { data, error } = await supabase
    .from("documents")
    .insert({ client_id: clientId, ...doc })
    .select()
    .single();
  if (error || !data) {
    console.error("addDocument error:", error);
    return null;
  }
  return data;
}

export async function updateDocument(
  docId: string,
  patch: Partial<Document>,
): Promise<Document | null> {
  const { data, error } = await supabase
    .from("documents")
    .update(patch)
    .eq("id", docId)
    .select()
    .single();
  if (error || !data) {
    console.error("updateDocument error:", error);
    return null;
  }
  return data;
}

export async function deleteDocument(docId: string): Promise<boolean> {
  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) {
    console.error("deleteDocument error:", error);
    return false;
  }
  return true;
}

export async function setDocumentStatus(
  docId: string,
  status: DocStatus,
): Promise<Document | null> {
  return updateDocument(docId, { status });
}

// ===== University CRUD =====
export async function addUniversity(
  clientId: string,
  u: Omit<University, "id" | "client_id">,
): Promise<University | null> {
  const { data, error } = await supabase
    .from("universities")
    .insert({ client_id: clientId, ...u })
    .select()
    .single();
  if (error || !data) {
    console.error("addUniversity error:", error);
    return null;
  }
  return data;
}

export async function updateUniversity(
  uId: string,
  patch: Partial<University>,
): Promise<University | null> {
  const { data, error } = await supabase
    .from("universities")
    .update(patch)
    .eq("id", uId)
    .select()
    .single();
  if (error || !data) {
    console.error("updateUniversity error:", error);
    return null;
  }
  return data;
}

export async function deleteUniversity(uId: string): Promise<boolean> {
  const { error } = await supabase.from("universities").delete().eq("id", uId);
  if (error) {
    console.error("deleteUniversity error:", error);
    return false;
  }
  return true;
}

// ===== Task CRUD =====
export async function addTask(
  clientId: string,
  t: Omit<Task, "id" | "client_id">,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ client_id: clientId, ...t })
    .select()
    .single();
  if (error || !data) {
    console.error("addTask error:", error);
    return null;
  }
  return data;
}

export async function updateTask(taskId: string, patch: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .select()
    .single();
  if (error || !data) {
    console.error("updateTask error:", error);
    return null;
  }
  return data;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) {
    console.error("deleteTask error:", error);
    return false;
  }
  return true;
}

// ===== Calendar Events CRUD =====
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    console.error("fetchCalendarEvents error:", error);
    return [];
  }
  return data ?? [];
}

export async function addCalendarEvent(
  event: Omit<CalendarEvent, "id">,
): Promise<CalendarEvent | null> {
  const { data, error } = await supabase.from("calendar_events").insert(event).select().single();
  if (error || !data) {
    console.error("addCalendarEvent error:", error);
    return null;
  }
  return data;
}

export async function updateCalendarEvent(
  id: string,
  patch: Partial<CalendarEvent>,
): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) {
    console.error("updateCalendarEvent error:", error);
    return null;
  }
  return data;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) {
    console.error("deleteCalendarEvent error:", error);
    return false;
  }
  return true;
}

// ===== Notifications CRUD =====
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchNotifications error:", error);
    return [];
  }
  return data ?? [];
}

export async function addNotification(
  n: Omit<Notification, "id" | "created_at">,
): Promise<Notification | null> {
  const { data, error } = await supabase.from("notifications").insert(n).select().single();
  if (error || !data) {
    console.error("addNotification error:", error);
    return null;
  }
  return data;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) {
    console.error("markNotificationRead error:", error);
    return false;
  }
  return true;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
  if (error) {
    console.error("markAllNotificationsRead error:", error);
    return false;
  }
  return true;
}

// ===== Fetchers =====
export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchClients error:", error);
    return [];
  }
  const clients = data ?? [];
  return Promise.all(clients.map((c) => hydrateClient(c)));
}

export async function fetchClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error || !data) {
    console.error("fetchClientById error:", error);
    return null;
  }
  return hydrateClient(data);
}

async function hydrateClient(raw: Record<string, unknown>): Promise<Client> {
  const clientId = raw.id as string;
  const [{ data: docs }, { data: unis }, { data: tasks }, { data: timeline }] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", clientId),
    supabase.from("universities").select("*").eq("client_id", clientId),
    supabase.from("tasks").select("*").eq("client_id", clientId),
    supabase
      .from("timeline_events")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: true }),
  ]);

  return {
    ...(raw as unknown as Client),
    documents: (docs ?? []) as Document[],
    universities: (unis ?? []) as University[],
    tasks: (tasks ?? []) as Task[],
    timeline: (timeline ?? []) as TimelineEvent[],
  };
}

// ===== Derived selectors =====
export function selectKpis(clients: Client[]) {
  const active = clients.filter((c) => c.status !== "Completed" && c.status !== "Lead").length;
  const waitingDocs = clients.filter((c) =>
    c.documents.some((d) => d.status === "Missing" || d.status === "Pending Review"),
  ).length;
  const today = new Date();
  const horizon = new Date();
  horizon.setMonth(today.getMonth() + 4);
  const deadlines = clients.filter((c) => c.deadline && new Date(c.deadline) < horizon).length;
  const submitted = clients.filter((c) => STAGES.indexOf(c.status) >= 3).length;
  const visasApproved = clients.filter(
    (c) => c.visa_status === "Approved" || c.status === "Completed",
  ).length;
  return { active, waitingDocs, deadlines, submitted, visasApproved, total: clients.length };
}

export function selectApplicationsByCountry(clients: Client[]) {
  const map = new Map<string, number>();
  clients.forEach((c) =>
    map.set(c.destination ?? "Unknown", (map.get(c.destination ?? "Unknown") ?? 0) + 1),
  );
  return Array.from(map.entries()).map(([country, count]) => ({ country, count }));
}

export function selectClientsByStage(clients: Client[]) {
  return STAGES.map((stage) => ({
    stage,
    count: clients.filter((c) => c.status === stage).length,
  }));
}

export function selectRecentActivity(clients: Client[]) {
  return clients
    .flatMap((c) => c.timeline.map((e) => ({ ...e, client: c.name, clientId: c.id })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

export function selectUrgentTasks(clients: Client[]) {
  return clients
    .flatMap((c) => c.tasks)
    .filter((t) => t.priority === "High" && t.status !== "Done")
    .slice(0, 6)
    .map((t) => ({ ...t, clientName: clients.find((c) => c.id === t.client_id)?.name ?? "" }));
}

export interface SearchResult {
  type: "Client" | "Task" | "University" | "Document";
  id: string;
  title: string;
  subtitle: string;
  clientId: string;
}

export function globalSearch(clients: Client[], q: string): SearchResult[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const out: SearchResult[] = [];
  for (const c of clients) {
    if (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.destination ?? "").toLowerCase().includes(query) ||
      (c.nationality ?? "").toLowerCase().includes(query)
    ) {
      out.push({
        type: "Client",
        id: c.id,
        title: c.name,
        subtitle: `${c.destination ?? ""} · ${c.status}`,
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

export function aiSuggestionsFor(client: Client): string[] {
  const out: string[] = [];
  const missing = client.documents.filter((d) => d.status === "Missing");
  if (missing.length)
    out.push(
      `This client is missing ${missing.length} required document${missing.length > 1 ? "s" : ""} (${missing.map((m) => m.name).join(", ")}).`,
    );
  const passport = client.documents.find((d) => d.name === "Passport");
  if (passport?.expires_at && new Date(passport.expires_at) < new Date("2027-01-01")) {
    out.push(
      "The passport expires within 6 months of the intended travel date. Renewal recommended.",
    );
  }
  const upcoming = client.tasks.filter((t) => t.status !== "Done").length;
  if (upcoming) out.push(`There are ${upcoming} upcoming tasks this week.`);
  if (!client.essay_reviewed) out.push("The statement of purpose has not been reviewed yet.");
  if (client.progress > 70)
    out.push("This application is almost complete — consider scheduling the visa appointment.");
  return out;
}
