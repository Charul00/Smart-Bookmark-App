import { FormEvent } from "react";

type BookmarkFormProps = {
  title: string;
  url: string;
  saving: boolean;
  error: string | null;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function BookmarkForm({
  title,
  url,
  saving,
  error,
  onTitleChange,
  onUrlChange,
  onSubmit,
}: BookmarkFormProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40 sm:p-5">
      <h2 className="text-sm font-medium text-slate-100">
        Add a new bookmark
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Bookmarks are private to your account and sync in real-time across
        tabs.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Optional title"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
          <input
            type="url"
            required
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:mt-0"
        >
          {saving ? "Saving…" : "Add bookmark"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-xs font-medium text-red-400">{error}</p>
      )}
    </section>
  );
}
