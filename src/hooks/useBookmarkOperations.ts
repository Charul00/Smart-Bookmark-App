import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthUser, Bookmark } from "@/types";

type UseBookmarkOperationsProps = {
  user: AuthUser;
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number | null>>;
  pageRef: React.MutableRefObject<number>;
  fetchBookmarks: (userId: string, page: number) => Promise<void>;
  showToast: (message: string, type: "success" | "error") => void;
};

export function useBookmarkOperations({
  user,
  bookmarks,
  setBookmarks,
  setTotalCount,
  pageRef,
  fetchBookmarks,
  showToast,
}: UseBookmarkOperationsProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddBookmark = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!user) return;

      if (!url.trim()) {
        setError("Please enter a URL.");
        showToast("Please enter a URL.", "error");
        return;
      }

      setSaving(true);
      setError(null);

      const { error } = await supabase.from("bookmarks").insert({
        title: title.trim() || url.trim(),
        url: url.trim(),
        user_id: user.id,
      });

      if (error) {
        console.error("Error adding bookmark", error);
        setError("Unable to add bookmark. Please try again.");
        showToast("Failed to add bookmark. Please try again.", "error");
      } else {
        setTitle("");
        setUrl("");
        showToast("Bookmark added successfully!", "success");
        if (pageRef.current === 1 && user) {
          setTimeout(() => {
            void fetchBookmarks(user.id, 1);
          }, 100);
        }
      }

      setSaving(false);
    },
    [user, url, title, pageRef, fetchBookmarks, showToast]
  );

  const handleDeleteBookmark = useCallback(
    async (id: string) => {
      if (!user) return;

      const bookmarkToDelete = bookmarks.find((b) => b.id === id);
      if (!bookmarkToDelete) {
        console.warn("Bookmark not found for deletion:", id);
        return;
      }

      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
      setTotalCount((prev) => (prev && prev > 0 ? prev - 1 : prev ?? null));

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Error deleting bookmark", error);
        setError("Unable to delete bookmark. Please try again.");
        showToast("Failed to delete bookmark. Please try again.", "error");
        setBookmarks((prev) => {
          const restored = [bookmarkToDelete, ...prev];
          restored.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          return restored;
        });
        setTotalCount((prev) => (prev ?? 0) + 1);
      } else {
        showToast("Bookmark deleted successfully!", "success");
        setTimeout(() => {
          setBookmarks((prev) =>
            prev.filter((bookmark) => bookmark.id !== id)
          );
        }, 100);
        if (pageRef.current !== 1 && bookmarks.length === 1) {
          setTimeout(() => {
            if (user && pageRef.current > 1) {
              void fetchBookmarks(user.id, pageRef.current - 1);
            }
          }, 300);
        }
      }
    },
    [
      user,
      bookmarks,
      setBookmarks,
      setTotalCount,
      pageRef,
      fetchBookmarks,
      showToast,
    ]
  );

  return {
    title,
    url,
    saving,
    error,
    setTitle,
    setUrl,
    handleAddBookmark,
    handleDeleteBookmark,
  };
}
