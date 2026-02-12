import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Bookmark } from "@/types";
import { PAGE_SIZE } from "@/constants";

type RealtimeStateSetters = {
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setTotalCount: React.Dispatch<React.SetStateAction<number | null>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
};

type PayloadRecord = { id?: string; user_id?: string; [key: string]: unknown };

/**
 * Production-grade Realtime subscription for bookmarks.
 * - Unique channel per user to avoid cross-tab conflicts
 * - Reconnection on subscription error
 * - Handles INSERT, UPDATE, DELETE; works even when payload.old is minimal (e.g. id only)
 */
export function useBookmarksRealtime(
  userId: string | null,
  pageRef: React.MutableRefObject<number>,
  fetchBookmarks: (uid: string, page: number) => Promise<void>,
  setters: RealtimeStateSetters
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settersRef = useRef(setters);
  settersRef.current = setters;

  const subscribe = useCallback(() => {
    if (!userId) return null;

    const channelName = `bookmarks:${userId}`;
    const { setBookmarks, setTotalCount, setHasMore } = settersRef.current;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload: {
          eventType?: string;
          new?: PayloadRecord | null;
          old?: PayloadRecord | null;
          old_record?: PayloadRecord | null;
        }) => {
          const eventType = String(payload.eventType ?? "").toUpperCase();
          const newRow = payload.new ?? null;
          const oldRow = payload.old ?? payload.old_record ?? null;
          const newRecord = newRow as PayloadRecord | null;
          const oldRecord = oldRow as PayloadRecord | null;

          if (eventType === "INSERT" && newRecord) {
            const record = newRecord as unknown as Bookmark;
            if (record.user_id !== userId) return;
            setTotalCount((prev) => (prev ?? 0) + 1);
            if (pageRef.current === 1) {
              setBookmarks((prev) => {
                const next = [record, ...prev];
                if (next.length > PAGE_SIZE) next.pop();
                return next;
              });
            } else {
              setHasMore(true);
            }
          } else if (eventType === "DELETE") {
            const deletedId =
              oldRecord?.id ??
              (newRecord as PayloadRecord)?.id ??
              (oldRecord as Record<string, unknown>)?.id;
            const deletedUserId =
              oldRecord?.user_id ??
              (newRecord as PayloadRecord)?.user_id;
            if (!deletedId) return;
            if (deletedUserId && deletedUserId !== userId) return;
            setTotalCount((prev) => (prev != null && prev > 0 ? prev - 1 : prev));
            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
          } else if (eventType === "UPDATE" && newRecord) {
            const record = newRecord as unknown as Bookmark;
            if (record.user_id !== userId) return;
            setBookmarks((prev) =>
              prev.map((b) => (b.id === record.id ? record : b))
            );
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          void fetchBookmarks(userId, pageRef.current);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
            subscribe();
          }, 2000);
        }
      });

    return channel;
  }, [userId, pageRef, fetchBookmarks]);

  useEffect(() => {
    if (!userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      return;
    }

    channelRef.current = subscribe();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, subscribe]);
}
