create table if not exists patient_call_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text default 'default',
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists patient_call_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references patient_call_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text not null default '',
  tool_call jsonb,
  created_at timestamptz default now()
);

alter table patient_call_sessions enable row level security;
alter table patient_call_messages enable row level security;

create policy "Allow all on patient_call_sessions" on patient_call_sessions for all using (true) with check (true);
create policy "Allow all on patient_call_messages" on patient_call_messages for all using (true) with check (true);
