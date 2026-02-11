import type { User } from "@supabase/supabase-js";

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
};

export type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export type AuthUser = User | null;
