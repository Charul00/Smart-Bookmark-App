# Smart Bookmark App

A private, real-time bookmark manager built with **Next.js (App Router)**, **Supabase (Auth, Database, Realtime)**, and **Tailwind CSS**.

## Features

- ✅ **Google OAuth Authentication**: Sign up and log in using Google only (no email/password)
- ✅ **Private Bookmarks**: Each user can only see and manage their own bookmarks
- ✅ **Real-time Updates**: Bookmarks sync instantly across multiple tabs without page refresh
- ✅ **CRUD Operations**: Add, view, and delete bookmarks with a clean, responsive UI
- ✅ **Pagination**: Efficiently handle large numbers of bookmarks (6 per page)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Platform account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Charul00/Smart-Bookmark-App.git
   cd Smart-Bookmark-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in `.env.local` with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Enable Google OAuth Provider

1. Navigate to **Authentication → Providers** in your Supabase dashboard
2. Find and click on **Google** provider
3. Enable the toggle switch
4. You'll need to set up OAuth credentials in Google Cloud Platform (see below)

### 3. Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Choose **Web application** as the application type
6. Add authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000`
   - For production: `https://your-app.vercel.app`
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase **Authentication → Providers → Google**

### 4. Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Create bookmarks table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Create RLS policies
create policy "Users can read their own bookmarks"
  on public.bookmarks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on public.bookmarks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own bookmarks"
  on public.bookmarks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 5. Enable Realtime

1. Go to **Database → Replication** in Supabase dashboard
2. Enable replication for the `bookmarks` table
3. This allows real-time updates to work

---

## Deployment

### Deploy to Vercel

1. **Push code to GitHub** (see below)

2. **Import project in Vercel**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click **Add New Project**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure environment variables**
   - In Vercel project settings → **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Update Supabase redirect URLs**
   - In Supabase **Authentication → URL Configuration**
   - Update **Site URL** to your Vercel domain: `https://your-app.vercel.app`
   - Add redirect URL: `https://your-app.vercel.app`

5. **Deploy**
   - Click **Deploy** in Vercel
   - Your app will be live at `https://your-app.vercel.app`

---

## Problems Encountered and Solutions

### Problem 1: Setting Up Google OAuth in Supabase

**Challenge**: Initially struggled to find and configure Google OAuth provider in Supabase. The Google provider option wasn't immediately visible, and setting up OAuth credentials in Google Cloud Platform was confusing.

**Solution**: 
- Watched YouTube tutorials on Supabase Google OAuth setup
- Referenced official Supabase documentation for OAuth configuration
- Used AI assistance (Claude AI) to understand the step-by-step process
- Found that you need to:
  1. Navigate to **Authentication → Providers** (not just Authentication)
  2. Scroll down to find the Google provider toggle
  3. Enable it first, then configure credentials
  4. Set up OAuth client in Google Cloud Console with correct redirect URIs
  5. Copy Client ID and Secret back to Supabase

**Key Learning**: The Google provider needs to be explicitly enabled before you can configure it, and the redirect URI format is crucial: `https://<project-ref>.supabase.co/auth/v1/callback`

---

### Problem 2: CRUD Operations and Row Level Security (RLS)

**Challenge**: After setting up the database, bookmarks could be created but:
- Users couldn't see their own bookmarks
- Delete operations were failing
- Getting "permission denied" errors

**Solution**: 
- Learned about Supabase Row Level Security (RLS) policies
- Discovered that RLS must be explicitly enabled on tables
- Created separate policies for each operation (SELECT, INSERT, DELETE, UPDATE)
- Each policy checks `auth.uid() = user_id` to ensure users can only access their own data
- Used the `to authenticated` clause to restrict access to logged-in users only

**Key SQL Policies**:
```sql
-- Example: Users can only read their own bookmarks
create policy "Users can read their own bookmarks"
  on public.bookmarks
  for select
  to authenticated
  using (auth.uid() = user_id);
```

**Key Learning**: RLS is disabled by default. You must enable it and create explicit policies for each CRUD operation. Without proper policies, even authenticated users will get permission errors.

---

### Problem 3: Real-time Updates Without Page Refresh

**Challenge**: Needed to implement real-time synchronization so that when a bookmark is added in one browser tab, it appears instantly in other open tabs without manual refresh.

**Solution**: 
- Implemented Supabase Realtime subscriptions using `postgres_changes`
- Created a channel that listens to all events (INSERT, UPDATE, DELETE) on the `bookmarks` table
- Used React state management to update the UI immediately when events are received
- Added filtering to ensure only events for the current user's bookmarks trigger UI updates
- Implemented optimistic updates for better UX (immediate UI feedback)

**Key Implementation**:
```typescript
const channel = supabase
  .channel("bookmarks-realtime")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookmarks" },
    (payload) => {
      // Filter by user_id and update React state
      if (payload.new?.user_id === currentUserId) {
        // Update bookmarks list immediately
        setBookmarks(prev => [...prev, payload.new]);
      }
    }
  )
  .subscribe();
```

**Key Learning**: 
- Supabase Realtime respects RLS policies automatically
- You need to enable replication on the table in Supabase dashboard
- The realtime subscription must be set up after user authentication
- Always filter events by `user_id` as an extra security measure
- Clean up subscriptions when component unmounts to prevent memory leaks

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page component
│   └── layout.tsx        # Root layout
├── components/
│   ├── auth/             # Authentication components
│   ├── bookmarks/        # Bookmark-related components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── constants/            # App constants
```

---

## License

MIT

---

## Live Demo

[Add your Vercel deployment URL here]

## Author

Built by [Your Name]
