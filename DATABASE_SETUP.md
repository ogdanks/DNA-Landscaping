# Database Setup Guide

Your app is deployed and connected to Postgres, but the database is **empty** — no
tables exist yet and there are no users, so login fails. This guide gets you logged
in. Pick **one** of the two methods below.

> **Default login created by either method:**
> - **Email:** `admin@landscaping.com`
> - **Password:** `admin123`
>
> ⚠️ **Change this password after your first login.**

---

## Method 1 — Paste SQL into your database dashboard (easiest, no tools needed)

This is the fastest path and needs nothing installed on your computer.

1. Open your database's SQL query editor:
   - **Vercel Postgres:** Vercel Dashboard → **Storage** → click your database → **Query** tab
   - **Neon:** **SQL Editor**
   - **Supabase:** **SQL Editor**
2. Open the file [`scripts/setup-database.sql`](scripts/setup-database.sql) in this
   repo, **copy its entire contents**, and paste it into the query editor.
3. Click **Run**.

That's it. It creates all tables **and** the admin user in one shot. The script is
safe to run more than once (it won't create duplicates or error out).

Now go to your app's `/login` page and sign in with the default credentials above.

---

## Method 2 — Run Prisma from your computer (recommended if you'll develop locally)

Use this if you have the project cloned locally and Node.js installed. It uses
Prisma's official migration, then seeds the admin user.

### Step 1 — Get your database connection string
From Vercel: **Storage → your DB → `.env.local` tab** (or **Project → Settings →
Environment Variables**). Copy the value of **`DATABASE_URL`** (or `POSTGRES_PRISMA_URL`).
It looks like:

```
postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
```

### Step 2 — Create the tables
From the project root, run (paste your real URL inline):

```bash
DATABASE_URL="postgresql://...your-url..." npx prisma migrate deploy
```

This applies the migration in `prisma/migrations/` and creates every table.

> If `migrate deploy` reports there are no migrations to apply but tables still
> don't exist, use `npx prisma db push` instead — it creates the tables directly
> from `prisma/schema.prisma`:
> ```bash
> DATABASE_URL="postgresql://...your-url..." npx prisma db push
> ```

### Step 3 — Create the admin user
```bash
DATABASE_URL="postgresql://...your-url..." npm run create-user
```

You'll see `✅ Admin user ready`. This script **hashes the password with bcrypt**
(the same way the app verifies logins) and is safe to run repeatedly — re-running
just resets the password back to the default.

**Want your own email/password instead of the defaults?** Pass them as env vars:

```bash
DATABASE_URL="postgresql://...your-url..." \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="your-strong-password" \
ADMIN_NAME="Your Name" \
npm run create-user
```

Now sign in at `/login`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Login says invalid credentials | Make sure you ran the setup (Method 1 or 2) against the **same** database your deployed app uses. Confirm a row exists: `SELECT email FROM "User";` |
| `relation "User" does not exist` at runtime | The tables weren't created. Run Method 1, or `prisma migrate deploy` / `prisma db push` (Method 2, Step 2). |
| `Can't reach database server` | Your `DATABASE_URL` is wrong or missing `?sslmode=require`. Recopy it from the Vercel Storage tab. |
| Logged in but pages are empty | That's expected — the app starts with no customers/jobs/invoices. Add data through the app UI. |

## What gets created

**Tables:** `User`, `Customer`, `Job`, `Estimate`, `Invoice`, `Account`,
`Session`, `VerificationToken` (plus their indexes and foreign keys).

**Seed data:** a single admin `User` row. No customers, jobs, estimates, or
invoices — you add those through the app.
