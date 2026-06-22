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
  name: string;
  status: DocStatus;
  uploadedAt?: string;
  expiresAt?: string;
  notes?: string;
}

export interface University {
  id: string;
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
  title: string;
  clientId: string;
  consultant: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "In Progress" | "Done";
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  destination: string;
  intake: string;
  status: Stage;
  consultant: string;
  progress: number;
  priority: "Low" | "Medium" | "High";
  university?: string;
  deadline?: string;
  email: string;
  phone: string;
  documents: Document[];
  universities: University[];
  tasks: Task[];
  timeline: TimelineEvent[];
  notes: string;
  essayReviewed: boolean;
  visaStatus: "Not Started" | "In Progress" | "Approved" | "Denied";
}

const DOC_TEMPLATE: Omit<Document, "id">[] = [
  { name: "Passport", status: "Approved", uploadedAt: "2026-02-12", expiresAt: "2029-08-01" },
  { name: "Transcript", status: "Approved", uploadedAt: "2026-02-20" },
  { name: "Diploma", status: "Pending Review", uploadedAt: "2026-03-02" },
  { name: "Recommendation Letter", status: "Missing" },
  { name: "English Test (IELTS)", status: "Approved", uploadedAt: "2026-01-30" },
  { name: "CV / Resume", status: "Approved", uploadedAt: "2026-02-05" },
  { name: "Statement of Purpose", status: "Pending Review", uploadedAt: "2026-03-10" },
  { name: "Financial Proof", status: "Missing" },
  { name: "Passport Photo", status: "Approved", uploadedAt: "2026-02-12" },
  { name: "Visa Application Form", status: "Missing" },
];

const NAMES = [
  "Aarav Sharma", "Sofia Martinez", "Liam Chen", "Amelia Okafor", "Noah Tanaka",
  "Isabella Rossi", "Mateo Silva", "Olivia Dubois", "Yusuf Demir", "Mei Wang",
  "Carlos Mendoza", "Priya Patel", "Ethan Kim", "Layla Hassan", "Lucas Becker",
  "Zara Ahmed", "Diego Rivera", "Nora Lindqvist", "Hiro Yamada", "Anaya Iyer",
];

export const COUNTRIES_FROM = ["India", "Brazil", "China", "Nigeria", "Japan", "Italy", "Mexico", "France", "Turkey", "Vietnam"];
export const DESTINATIONS = ["Canada", "USA", "UK", "Germany", "Australia", "Netherlands", "Ireland", "France"];
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

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function buildSeed(): Client[] {
  return NAMES.map((name, i) => {
    const stage = STAGES[i % STAGES.length];
    const progress = Math.min(100, (STAGES.indexOf(stage) + 1) * 12 + (i % 5));
    const destination = pick(DESTINATIONS, i);
    const uni =
      UNIVERSITIES_LIST.find(u => u.country === destination) ??
      UNIVERSITIES_LIST[i % UNIVERSITIES_LIST.length];
    const docs: Document[] = DOC_TEMPLATE.map((d, j) => ({ ...d, id: `${i}-doc-${j}` }));
    if (i % 3 === 0) docs[3].status = "Approved";
    if (i % 4 === 0) docs[7].status = "Pending Review";

    return {
      id: `client-${i + 1}`,
      name,
      photo: `https://i.pravatar.cc/120?img=${(i % 70) + 1}`,
      nationality: pick(COUNTRIES_FROM, i),
      destination,
      intake: pick(INTAKES, i),
      status: stage,
      consultant: pick(CONSULTANTS, i),
      progress,
      priority: (["Low", "Medium", "High"] as const)[i % 3],
      university: uni.name,
      deadline: `2026-${String((i % 9) + 3).padStart(2, "0")}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
      phone: `+1 555 0${100 + i}`,
      documents: docs,
      universities: [
        { id: `${i}-u1`, ...uni, deadline: "2026-09-15", status: i % 4 === 0 ? "Accepted" : "Applied", scholarship: i % 3 === 0 ? "$8,000 / year" : undefined },
        { id: `${i}-u2`, ...UNIVERSITIES_LIST[(i + 2) % UNIVERSITIES_LIST.length], deadline: "2026-11-01", status: "Waiting" },
      ],
      tasks: [
        { id: `${i}-t1`, title: "Request official transcript", clientId: `client-${i + 1}`, consultant: pick(CONSULTANTS, i), deadline: "2026-04-12", priority: "High", status: "In Progress" },
        { id: `${i}-t2`, title: "Review statement of purpose", clientId: `client-${i + 1}`, consultant: pick(CONSULTANTS, i + 1), deadline: "2026-04-20", priority: "Medium", status: "Todo" },
        { id: `${i}-t3`, title: "Book visa appointment", clientId: `client-${i + 1}`, consultant: pick(CONSULTANTS, i + 2), deadline: "2026-05-02", priority: "High", status: "Todo" },
      ],
      timeline: [
        { id: `${i}-e1`, date: "2026-01-10", type: "Consultation", title: "Initial consultation completed" },
        { id: `${i}-e2`, date: "2026-02-12", type: "Documents", title: "Passport and photo uploaded" },
        { id: `${i}-e3`, date: "2026-02-28", type: "English Test", title: "IELTS results received (7.5)" },
        { id: `${i}-e4`, date: "2026-03-15", type: "Application", title: `Application submitted to ${uni.name}` },
        ...(STAGES.indexOf(stage) >= 4 ? [{ id: `${i}-e5`, date: "2026-04-05", type: "Offer", title: `Offer received from ${uni.name}` }] : []),
        ...(STAGES.indexOf(stage) >= 5 ? [{ id: `${i}-e6`, date: "2026-05-10", type: "Visa", title: "Visa interview scheduled" }] : []),
      ],
      notes: "Strong academic profile. Prefers cities with good public transport. Family is supportive of relocation.",
      essayReviewed: i % 3 !== 0,
      visaStatus: STAGES.indexOf(stage) >= 5 ? "In Progress" : "Not Started",
    };
  });
}

export const TEAM = [
  { id: "u1", name: "Emma Wilson", role: "Administrator", email: "emma@mobilityos.com", photo: "https://i.pravatar.cc/100?img=47", clients: 12 },
  { id: "u2", name: "James Carter", role: "Consultant", email: "james@mobilityos.com", photo: "https://i.pravatar.cc/100?img=12", clients: 9 },
  { id: "u3", name: "Priya Singh", role: "Consultant", email: "priya@mobilityos.com", photo: "https://i.pravatar.cc/100?img=32", clients: 11 },
  { id: "u4", name: "Lukas Meyer", role: "Assistant", email: "lukas@mobilityos.com", photo: "https://i.pravatar.cc/100?img=15", clients: 5 },
];

export const WORKFLOWS = [
  { id: "wf1", name: "Canada Student", country: "Canada", steps: ["Consultation", "Documents", "IELTS", "College Application", "Offer Letter", "Study Permit", "Accommodation", "Flight"] },
  { id: "wf2", name: "USA Undergraduate", country: "USA", steps: ["Consultation", "SAT", "Common App", "Acceptance", "I-20", "F1 Visa", "Travel"] },
  { id: "wf3", name: "UK Master's", country: "UK", steps: ["Consultation", "IELTS", "UCAS Application", "Conditional Offer", "CAS Letter", "Tier 4 Visa", "Accommodation", "Flight"] },
];

export function aiSuggestionsFor(client: Client): string[] {
  const out: string[] = [];
  const missing = client.documents.filter(d => d.status === "Missing");
  if (missing.length)
    out.push(`This client is missing ${missing.length} required document${missing.length > 1 ? "s" : ""} (${missing.map(m => m.name).join(", ")}).`);
  const passport = client.documents.find(d => d.name === "Passport");
  if (passport?.expiresAt && new Date(passport.expiresAt) < new Date("2027-01-01")) {
    out.push("The passport expires within 6 months of the intended travel date. Renewal recommended.");
  }
  const upcoming = client.tasks.filter(t => t.status !== "Done").length;
  if (upcoming) out.push(`There are ${upcoming} upcoming tasks this week.`);
  if (!client.essayReviewed) out.push("The statement of purpose has not been reviewed yet.");
  if (client.progress > 70) out.push("This application is almost complete — consider scheduling the visa appointment.");
  return out;
}
