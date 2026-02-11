import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Bookmark, AuthUser } from "@/types";
import { PAGE_SIZE } from "@/constants";

export function useBookmarks(user: AuthUser) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const fetchInFlightRef = useRef(false);

  const fetchBookmarks = useCallback(
    async (userId: string, pageToLoad = 1) => {
      if (fetchInFlightRef.current) return;
      fetchInFlightRef.current = true;
      setLoadingBookmarks(true);
      const from = (pageToLoad - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      try {
        const { data, error, count } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching bookmarks", error);
      } else {
        setBookmarks(data as Bookmark[]);
        setPage(pageToLoad);
        pageRef.current = pageToLoad;
        setTotalCount(count ?? null);
        setHasMore(count ? to + 1 < count : false);
      }
      } finally {
        fetchInFlightRef.current = false;
        setLoadingBookmarks(false);
      }
    },
    []
  );

  const subscribeToRealtime = useCallback(
    (userId: string) => {
      return supabase
        .channel("bookmarks-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookmarks" },
          (payload) => {
            const newRecord = (payload.new ?? payload.old) as Bookmark | null;
            if (!newRecord || newRecord.user_id !== userId) return;

            if (payload.eventType === "INSERT") {
              setTotalCount((prev) => (prev ?? 0) + 1);
              if (pageRef.current === 1) {
                setBookmarks((prev) => {
                  const next = [newRecord, ...prev];
                  if (next.length > PAGE_SIZE) {
                    next.pop();
                  }
                  return next;
                });
              }
              setHasMore(true);
            } else if (payload.eventType === "DELETE") {
              const deletedId = newRecord.id;
              setTotalCount((prev) =>
                prev && prev > 0 ? prev - 1 : prev ?? null
              );
              setBookmarks((prev) => {
                const filtered = prev.filter(
                  (bookmark) => bookmark.id !== deletedId
                );
                return filtered;
              });
            } else if (payload.eventType === "UPDATE") {
              setBookmarks((prev) =>
                prev.map((bookmark) =>
                  bookmark.id === newRecord.id ? newRecord : bookmark
                )
              );
            }
          }
        )
        .subscribe();
    },
    []
  );

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setPage(1);
      pageRef.current = 1;
      setTotalCount(null);
      setHasMore(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    void fetchBookmarks(userId, 1);
    channel = subscribeToRealtime(userId);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, fetchBookmarks, subscribeToRealtime]);

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
