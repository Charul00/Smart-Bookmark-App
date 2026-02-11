import type { Bookmark } from "@/types";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
};

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname.replace("www.", "");
    }
  } catch {
    domain = bookmark.url || "";
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-4 shadow-lg shadow-black/20 transition-all hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 sm:p-5">
      {/* Header with icon and delete */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-base font-bold text-sky-300 ring-1 ring-sky-500/20 transition-transform group-hover:scale-110 sm:h-12 sm:w-12 sm:text-lg">
          {domain.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="group/delete shrink-0 rounded-lg border border-slate-700/50 bg-slate-900/50 p-1.5 text-slate-400 opacity-100 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 sm:p-2 sm:opacity-0 sm:group-hover:opacity-100"
          title="Delete bookmark"
        >
          <svg
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col min-h-0">
        <h3
          className="mb-2 text-sm font-semibold leading-snug text-slate-50 group-hover:text-sky-100 transition-colors break-words overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          title={bookmark.title}
        >
          {bookmark.title}
        </h3>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-sky-400"
        >
          <span className="truncate">{domain}</span>
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
        <div className="mt-auto flex items-center gap-1.5 text-[10px] text-slate-500">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {new Date(bookmark.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
