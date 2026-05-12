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

create table if not exists retail_items (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  label text not null,
  price numeric(12,4) not null default 0,
  price_key text not null unique,
  total_key text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into retail_items (key, label, price, price_key, total_key, sort_order, is_active) values
  ('ENVELOPEWHITESmallPRINTED',   'ENVELOPE WHITE Small (PRINTED)',   2.11,   'Price',   'Total',   1,  true),
  ('ENVELOPEWHITEMEDIUMPRINTED',   'ENVELOPE WHITE MEDIUM (PRINTED)',  5.16,   'Price2',  'Total2',  2,  true),
  ('ENVELOPEWHITELARGEPRINTED',    'ENVELOPE WHITE LARGE ( PRINTED)',  6.72,   'Price3',  'Total3',  3,  true),
  ('FLYEREXPRESSSMALL',            'FLYER EXPRESS SMALL',              6.00,   'Price4',  'Total4',  4,  true),
  ('EXPRESSFLYERLARGE',            'EXPRESS FLYER LARGE',              11.00,  'Price5',  'Total5',  5,  true),
  ('REDBOX1KG',                    'RED BOX 1KG',                      32.95,  'Price6',  'Total6',  6,  true),
  ('REDBOX2KG',                    'RED BOX 2KG',                      54.07,  'Price7',  'Total7',  7,  true),
  ('REDBOX3KG',                    'RED BOX 3KG',                      62.80,  'Price8',  'Total8',  8,  true),
  ('REDBOX5KG',                    'RED BOX 5KG',                      91.20,  'Price9',  'Total9',  9,  true),
  ('REDBOX10KG',                   'RED BOX 10KG',                     129.60, 'Price10', 'Total10', 10, true),
  ('REDBOX15KG',                   'RED BOX 15KG',                     166.85, 'Price11', 'Total11', 11, true),
  ('REDBOX20KG',                   'RED BOX 20KG',                     191.30, 'Price12', 'Total12', 12, true),
  ('REDBOX25KG',                   'RED BOX 25KG',                     231.00, 'Price13', 'Total13', 13, true),
  ('TCSECONOMYBOX2KG',             'TCS ECONOMY BOX 2KG',              54.70,  'Price14', 'Total14', 14, true),
  ('TCSECONOMYBOX5KG',             'TCS ECONOMY BOX 5KG',              91.20,  'Price15', 'Total15', 15, true),
  ('TCSECONOMYBOX10KG',            'TCS ECONOMY BOX 10KG',             129.60, 'Price16', 'Total16', 16, true),
  ('TCSECONOMYBOX25KG',            'TCS ECONOMY BOX 25KG',             216.00, 'Price17', 'Total17', 17, true),
  ('ThermalPrinterRoll',           'Thermal Printer Roll',             134.00, 'Price18', 'Total18', 18, true),
  ('PackagingTape1',               'Packaging Tape 1"',                59.00,  'Price19', 'Total19', 19, true),
  ('PackagingTape2',               'Packaging Tape 2"',                115.00, 'Price20', 'Total20', 20, true),
  ('PLASTICBAG',                   'PLASTIC BAG',                      280.00, 'Price21', 'Total21', 21, true),
  ('STICKERFRAGILE',               'STICKER FRAGILE',                  1.94,   'Price22', 'Total22', 22, true),
  ('STICKERTIMECHOICEDELIVERY',    'STICKER TIME CHOICE DELIVERY',     1.02,   'Price23', 'Total23', 23, true),
  ('STICKEREXTRACARE',             'STICKER EXTRA CARE',               1.94,   'Price24', 'Total24', 24, true),
  ('STICKERSSPECIALINSTRUCTION',   'STICKERS SPECIAL INSTRUCTION',     1.94,   'Price25', 'Total25', 25, true),
  ('STICKERECONOMYEXPRESS2NDDay',  'STICKER ECONOMY EXPRESS 2ND Day',  1.63,   'Price26', 'Total26', 26, true),
  ('MARKERTOYO',                   'MARKER TOYO',                      29.90,  'Price27', 'Total27', 27, true),
  ('STAPLERPINMEDIUM',             'STAPLER PIN MEDIUM',               45.00,  'Price28', 'Total28', 28, true),
  ('CUTTER',                       'CUTTER',                           33.00,  'Price29', 'Total29', 29, true),
  ('PENBALLPOINT',                 'PEN (BALL POINT)',                  7.25,   'Price30', 'Total30', 30, true),
  ('MyCollectStickers',            'My Collect Stickers',              1.94,   'Price31', 'Total31', 31, true),
  ('MyReturnStickers',             'My Return Stickers',               1.70,   'Price32', 'Total32', 32, true),
  ('RubberBand2No500Gms',          'Rubber Band 2 No 500Gms',          550.00, 'Price33', 'Total33', 33, true),
  ('HILIGHTERDOLLAR',              'HI-LIGHTER DOLLAR',                28.00,  'Price34', 'Total34', 34, true),
  ('STAPLERMEDIUM',                'STAPLER MEDIUM',                   240.00, 'Price35', 'Total35', 35, true),
  ('TCSMehfooz',                   'TCS Mehfooz',                      64.00,  'Price36', 'Total36', 36, true)
on conflict (key) do nothing;

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
