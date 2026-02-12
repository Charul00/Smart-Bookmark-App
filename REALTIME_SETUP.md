# Enable Realtime for Smart Bookmark App

**Without this, the bookmark list will NOT update in other tabs until you refresh.**

Follow these steps in your Supabase project:

---

## Step 1: Open Replication

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. In the left sidebar, click **Database**.
3. Click **Replication** (under Database).

---

## Step 2: Add `bookmarks` to the publication

1. On the Replication page you’ll see **Publication: supabase_realtime** (or similar).
2. Find the list of **Tables in publication** (or **Tables** / **Source**).
3. Click **Edit publication** or **Add tables** (or the + / Edit icon).
4. In the list of tables, find **public.bookmarks** (or just **bookmarks**).
5. **Turn ON** or **check** the `bookmarks` table so it’s included in the publication.
6. Click **Save** or **Update**.

---

## Step 3: Confirm

- After saving, **bookmarks** should appear in the list of tables that are replicated for Realtime.
- Reload your app, open two tabs, add a bookmark in one tab — it should appear in the other without refresh.

---

## If you don’t see Replication or Publications

- Some plans show this under **Database → Replication**.
- If your UI is different, look for:
  - **Replication**
  - **Publications**
  - **supabase_realtime**
- You can also run this in **SQL Editor** to add the table to the realtime publication:

```sql
-- Add bookmarks table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

Run that once. If you see an error like "table is already in publication", Realtime is already enabled for `bookmarks`. Then try the two-tab test again.
