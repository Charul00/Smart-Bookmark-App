type PaginationProps = {
  page: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function Pagination({
  page,
  totalCount,
  pageSize,
  hasMore,
  loading,
  onPrevious,
  onNext,
}: PaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <span className="text-center text-[11px] text-slate-400 sm:text-left">
        Showing{" "}
        <span className="font-semibold text-slate-200">
          {(page - 1) * pageSize + 1}
        </span>{" "}
        –{" "}
        <span className="font-semibold text-slate-200">
          {Math.min(page * pageSize, totalCount)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-200">{totalCount}</span>{" "}
        bookmarks
      </span>
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          onClick={onPrevious}
          disabled={page === 1 || loading}
          className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-1"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasMore || loading}
          className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
