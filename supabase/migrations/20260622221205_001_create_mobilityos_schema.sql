/*
# MobilityOS Database Schema — Initial Migration

1. New Tables
- `clients` — core client records for the mobility agency
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `email` (text, not null)
  - `phone` (text)
  - `nationality` (text)
  - `destination` (text)
  - `intake` (text)
  - `status` (text) — pipeline stage
  - `consultant` (text)
  - `progress` (integer, default 0)
  - `priority` (text)
  - `university` (text)
  - `deadline` (date)
  - `notes` (text)
  - `essay_reviewed` (boolean, default false)
  - `visa_status` (text)
  - `photo` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- `documents` — client documents
  - `id` (uuid, primary key)
  - `client_id` (uuid, references clients)
  - `name` (text)
  - `status` (text)
  - `uploaded_at` (date)
  - `expires_at` (date)
  - `notes` (text)
  - `category` (text)
  - `created_at` (timestamptz)

- `universities` — university applications per client
  - `id` (uuid, primary key)
  - `client_id` (uuid, references clients)
  - `name` (text)
  - `country` (text)
  - `program` (text)
  - `deadline` (date)
  - `status` (text)
  - `scholarship` (text)
  - `notes` (text)
  - `created_at` (timestamptz)

- `tasks` — team tasks linked to clients
  - `id` (uuid, primary key)
  - `client_id` (uuid, references clients)
  - `title` (text)
  - `consultant` (text)
  - `deadline` (date)
  - `priority` (text)
  - `status` (text)
  - `created_at` (timestamptz)

- `timeline_events` — client journey timeline
  - `id` (uuid, primary key)
  - `client_id` (uuid, references clients)
  - `date` (date)
  - `type` (text)
  - `title` (text)
  - `description` (text)
  - `created_at` (timestamptz)

- `calendar_events` — standalone calendar events
  - `id` (uuid, primary key)
  - `title` (text)
  - `date` (date)
  - `type` (text)
  - `client_id` (uuid, references clients, nullable)
  - `description` (text)
  - `created_at` (timestamptz)

- `notifications` — in-app notification center
  - `id` (uuid, primary key)
  - `title` (text)
  - `message` (text)
  - `type` (text)
  - `read` (boolean, default false)
  - `link` (text)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all tables.
- Single-tenant app: allow anon + authenticated CRUD on all tables.
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  destination text,
  intake text,
  status text DEFAULT 'Lead',
  consultant text,
  progress integer NOT NULL DEFAULT 0,
  priority text DEFAULT 'Medium',
  university text,
  deadline date,
  notes text,
  essay_reviewed boolean NOT NULL DEFAULT false,
  visa_status text DEFAULT 'Not Started',
  photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'Pending Review',
  uploaded_at date,
  expires_at date,
  notes text,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  country text,
  program text,
  deadline date,
  status text DEFAULT 'Applied',
  scholarship text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  consultant text,
  deadline date,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Todo',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  type text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  type text DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_universities" ON universities;
CREATE POLICY "anon_select_universities" ON universities FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_universities" ON universities;
CREATE POLICY "anon_insert_universities" ON universities FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_universities" ON universities;
CREATE POLICY "anon_update_universities" ON universities FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_universities" ON universities;
CREATE POLICY "anon_delete_universities" ON universities FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_timeline" ON timeline_events;
CREATE POLICY "anon_select_timeline" ON timeline_events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_timeline" ON timeline_events;
CREATE POLICY "anon_insert_timeline" ON timeline_events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_timeline" ON timeline_events;
CREATE POLICY "anon_update_timeline" ON timeline_events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_timeline" ON timeline_events;
CREATE POLICY "anon_delete_timeline" ON timeline_events FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_calendar" ON calendar_events;
CREATE POLICY "anon_select_calendar" ON calendar_events FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_calendar" ON calendar_events;
CREATE POLICY "anon_insert_calendar" ON calendar_events FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_calendar" ON calendar_events;
CREATE POLICY "anon_update_calendar" ON calendar_events FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_calendar" ON calendar_events;
CREATE POLICY "anon_delete_calendar" ON calendar_events FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_destination ON clients(destination);
CREATE INDEX IF NOT EXISTS idx_clients_consultant ON clients(consultant);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_universities_client_id ON universities(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_timeline_client_id ON timeline_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_client_id ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
