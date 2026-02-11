import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Bookmark, AuthUser } from "@/types";
import { PAGE_SIZE } from "@/constants";
import { useBookmarksRealtime } from "./useBookmarksRealtime";

export function useBookmarks(user: AuthUser) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const fetchInFlightRef = useRef(false);

  const fetchBookmarks = useCallback(
    async (uid: string, pageToLoad = 1) => {
      if (fetchInFlightRef.current) return;
      fetchInFlightRef.current = true;
      setLoadingBookmarks(true);
      const from = (pageToLoad - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      try {
        const { data, error, count } = await supabase
          .from("bookmarks")
          .select("*", { count: "exact" })
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching bookmarks", error);
        } else {
          setBookmarks((data as Bookmark[]) ?? []);
          setPage(pageToLoad);
          pageRef.current = pageToLoad;
          setTotalCount(count ?? null);
          setHasMore(Boolean(count && to + 1 < count));
        }
      } finally {
        fetchInFlightRef.current = false;
        setLoadingBookmarks(false);
      }
    },
    []
  );

  const userId = user?.id ?? null;

  useBookmarksRealtime(
    userId,
    pageRef,
    fetchBookmarks,
    { setBookmarks, setTotalCount, setHasMore }
  );

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setPage(1);
      pageRef.current = 1;
      setTotalCount(null);
      setHasMore(false);
      return;
    }
    void fetchBookmarks(userId, 1);
  }, [userId, fetchBookmarks]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  return {
    bookmarks,
    setBookmarks,
    loadingBookmarks,
    page,
    totalCount,
    setTotalCount,
    hasMore,
    pageRef,
    fetchBookmarks,
  };
}
