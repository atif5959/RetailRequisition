create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'head', 'super_admin')) default 'admin',
  region text,
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists region text;

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin', 'head', 'super_admin'));

create table if not exists regions (
  name text primary key
);

insert into regions (name)
values
('Karachi'),
('Lahore'),
('Islamabad'),
('Rawalpindi'),
('Quetta'),
('Gujranwala'),
('Sialkot'),
('Faisalabad'),
('Multan'),
('Sukkur'),
('Hyderabad'),
('Peshawar')
on conflict (name) do nothing;

create table if not exists form_fields (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  field_key text not null unique,
  field_type text not null check (field_type in ('text','textarea','number','date','select','checkbox')),
  required boolean not null default false,
  options jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists form_submissions (
  id uuid primary key default uuid_generate_v4(),
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table form_submissions add column if not exists region text;

create table if not exists form_submission_values (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references form_submissions(id) on delete cascade,
  field_key text not null,
  value text,
  created_at timestamptz not null default now()
);

create table if not exists approval_logs (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references form_submissions(id) on delete cascade,
  changed_by uuid references profiles(id),
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table form_fields enable row level security;
alter table form_submissions enable row level security;
alter table form_submission_values enable row level security;
alter table approval_logs enable row level security;

-- This app uses service role key inside server routes for dashboard/form APIs.
-- Public browser access is not required for DB tables.

insert into form_fields (label, field_key, field_type, required, options, sort_order)
values
('Employee Name', 'employee_name', 'text', true, null, 1),
('Department', 'department', 'text', true, null, 2),
('Required Date', 'required_date', 'date', true, null, 3),
('Item Name', 'item_name', 'text', true, null, 4),
('Quantity', 'quantity', 'number', true, null, 5),
('Priority', 'priority', 'select', true, '["Normal", "Urgent"]'::jsonb, 6),
('Reason / Notes', 'notes', 'textarea', false, null, 7)
on conflict (field_key) do nothing;
