## Smart Bookmark App

Private, real‑time bookmark manager built with **Next.js (App Router)**, **Supabase (Auth, Database, Realtime)** and **Tailwind CSS**.

### Features

- **Google login only**: Users sign up and log in with Google via Supabase Auth.
- **Private bookmarks**: Each bookmark row is tied to the authenticated user; row‑level security prevents cross‑user access.
- **Realtime updates**: Bookmark list updates live across tabs using Supabase Realtime (`postgres_changes`).
- **Simple CRUD**: Add (URL + optional title) and delete your own bookmarks.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...       # e.g. https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # anon public key
```

Then run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 2. Supabase configuration

### 2.1 Create project and enable Google provider

1. Create a new Supabase project.
2. Go to **Authentication → URL configuration** and set:
   - **Site URL**: your local dev URL during development (`http://localhost:3000`) and later your Vercel URL.
3. Go to **Authentication → Providers → Google**:
   - Enable Google.
   - Configure the OAuth credentials in Google Cloud.
   - Use your Site URL as an allowed redirect.

Copy your **Project URL** and **anon public key** into `.env.local`.

### 2.2 Database schema

Create the `bookmarks` table (SQL editor → New query):

```sql
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  title text not null,
  created_at timestamptz not null default now()
);
```

### 2.3 Row Level Security (RLS)

Turn on RLS for `bookmarks` and add these policies:

```sql
-- Allow authenticated users to manage only their own bookmarks
create policy "Users can read their own bookmarks"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);

create policy "Users can update their own bookmarks"
  on public.bookmarks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Supabase Realtime respects these policies, so clients only receive changes for rows they are allowed to see.

---

## 3. How the app works

- **Auth**:
  - The home page is a client component.
  - On load it calls `supabase.auth.getUser()` and subscribes to `onAuthStateChange` to keep the user in sync.
  - A **“Continue with Google”** button triggers `signInWithOAuth({ provider: "google" })`.
- **Bookmarks**:
  - Once a user is present, the app fetches `bookmarks` filtered by `user_id`.
  - Inserts set `user_id` to `user.id`; deletes use both `id` and `user_id` as a safety check.
- **Realtime**:
  - The app opens a Supabase channel on `postgres_changes` for the `bookmarks` table.
  - For each event (`INSERT`, `UPDATE`, `DELETE`), it:
    - Ignores rows where `user_id` doesn’t match the current user (extra guard on top of RLS).
    - Updates local React state so all open tabs stay in sync without reloads.

---

## 4. Deploying to Vercel

1. **Create a public GitHub repo**
   - In this folder:
     ```bash
     git init
     git add .
     git commit -m "Initial smart bookmark app"
     ```
   - Create an empty public repo on GitHub.
   - Add it as a remote and push:
     ```bash
     git remote add origin git@github.com:<your-username>/<your-repo>.git
     git push -u origin main
     ```

2. **Create a new Vercel project**
   - Go to Vercel and **Import** the GitHub repo.
   - Framework preset should auto‑detect **Next.js**.

3. **Set environment variables in Vercel**
   - In Vercel project settings → **Environment Variables**, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Use the same values as in your local `.env.local`.

4. **Connect Vercel URL back to Supabase**
   - In Supabase Auth settings, update **Site URL** and any redirect URLs to your Vercel domain
     (for example, `https://your-app.vercel.app`).

5. **Trigger a deploy**
   - Push to `main` or click **Deploy** in Vercel.
   - After deploy, open the Vercel URL, sign in with Google, and test adding/deleting bookmarks and realtime across tabs.

---

## 5. Problems encountered and how they were solved

- **Scaffolding permissions error**
  - Problem: `create-next-app` initially failed with a “application path is not writable” error.
  - Fix: Re‑ran the scaffold command with appropriate permissions so the project could be created in the desired folder.

- **Ensuring bookmarks are user‑private**
  - Problem: It’s easy to accidentally let users see each other’s data if RLS isn’t configured correctly.
  - Fix: Added `user_id` to each row, enabled RLS, and wrote explicit `select/insert/update/delete` policies that always compare `auth.uid()` to `user_id`. The client also filters by `user_id` when querying and deleting.

- **Realtime updates without leaking data**
  - Problem: Subscribing to `postgres_changes` on the entire `bookmarks` table could, in theory, expose other users’ data if security isn’t tight.
  - Fix: Relied on Supabase Realtime honoring RLS and added an extra guard in the client to ignore events where `user_id` does not match the current user, before mutating local state.

- **Handling OAuth redirects cleanly**
  - Problem: Making sure the OAuth redirect brings the user back into a working session without extra routes.
  - Fix: Used `signInWithOAuth` with `redirectTo` set to the app’s origin. On load, the client calls `getUser` and listens to `onAuthStateChange`, so the UI correctly reflects the new authenticated session after redirect.

---

## 6. Tech stack

- **Frontend**: Next.js (App Router, TypeScript), React
- **Styling**: Tailwind CSS (v4)
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **Deployment**: Vercel

