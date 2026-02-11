import type { Bookmark } from "@/types";
import { BookmarkCard } from "./BookmarkCard";

type BookmarkGridProps = {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
};

export function BookmarkGrid({ bookmarks, onDelete }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/50 sm:h-16 sm:w-16">
          <svg
            className="h-6 w-6 text-slate-500 sm:h-8 sm:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">No bookmarks yet</p>
        <p className="mt-1 text-center text-xs text-slate-500">
          Add your first bookmark above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
