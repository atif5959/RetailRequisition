# Retail Requisition App

Next.js + Supabase app for a public retail requisition form and protected dashboard.

## Features

- Public requisition form without login
- Dashboard login using Supabase Auth
- Admin can view requisitions and approve/reject
- Super admin can manage form fields dynamically
- Supabase PostgreSQL database
- Vercel-ready

## Setup

1. Create Supabase project.
2. Open Supabase SQL Editor and run `supabase/schema.sql`.
3. Create a dashboard user in Supabase Auth.
4. Add a row in `profiles` table:

```sql
insert into profiles (id, email, role)
values ('AUTH_USER_ID_HERE', 'your@email.com', 'super_admin');
```

5. Copy `.env.example` to `.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

6. Install and run:

```bash
npm install
npm run dev
```

## Routes

- `/form/retail-requisition` public form
- `/dashboard/login` dashboard login
- `/dashboard/requisitions` submissions list
- `/dashboard/form-fields` super admin field builder
- `/dashboard/users` user list

## Deploy to Vercel

- Push this project to GitHub.
- Import in Vercel.
- Add same environment variables in Vercel.
- Deploy.
