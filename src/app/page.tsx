"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useBookmarkOperations } from "@/hooks/useBookmarkOperations";
import { useToast } from "@/hooks/useToast";
import { Header } from "@/components/auth/Header";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ToastContainer } from "@/components/ui/Toast";
import { BookmarkForm } from "@/components/bookmarks/BookmarkForm";
import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid";
import { Pagination } from "@/components/bookmarks/Pagination";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PAGE_SIZE } from "@/constants";

export default function Home() {
  const { user, initialising, signInWithGoogle, signOut } = useAuth();
  const { toasts, showToast } = useToast();
  const {
    bookmarks,
    setBookmarks,
    loadingBookmarks,
    page,
    totalCount,
    setTotalCount,
    hasMore,
    pageRef,
    fetchBookmarks,
  } = useBookmarks(user);

  const {
    title,
    url,
    saving,
    error,
    setTitle,
    setUrl,
    handleAddBookmark,
    handleDeleteBookmark,
  } = useBookmarkOperations({
    user,
    bookmarks,
    setBookmarks,
    setTotalCount,
    pageRef,
    fetchBookmarks,
    showToast,
  });

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  // Show toast on auth state changes (subscribe once to avoid duplicate listeners)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        showToastRef.current("Successfully signed in!", "success");
      } else if (event === "SIGNED_OUT") {
        showToastRef.current("Successfully signed out!", "success");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePreviousPage = () => {
    if (!user || page <= 1 || loadingBookmarks) return;
    void fetchBookmarks(user.id, page - 1);
  };

  const handleNextPage = () => {
    if (!user || !hasMore || loadingBookmarks) return;
    void fetchBookmarks(user.id, page + 1);
  };

  if (initialising) {
    return (
      <>
        <LoadingScreen />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen onSignIn={signInWithGoogle} error={error} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-screen justify-center bg-slate-950 px-3 py-6 sm:px-4 sm:py-10 text-slate-50">
        <main className="flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
          <Header user={user} onSignOut={signOut} />

          <BookmarkForm
            title={title}
            url={url}
            saving={saving}
            error={error}
            onTitleChange={setTitle}
            onUrlChange={setUrl}
            onSubmit={handleAddBookmark}
          />

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-slate-100">
                Your bookmarks
              </h2>
            </div>

            <BookmarkGrid
              bookmarks={bookmarks}
              onDelete={handleDeleteBookmark}
            />

            {totalCount !== null && totalCount > 0 && (
              <Pagination
                page={page}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                hasMore={hasMore}
                loading={loadingBookmarks}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            )}
          </section>
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
