import type { AuthUser } from "@/types";

type HeaderProps = {
  user: AuthUser;
  onSignOut: () => void;
};

export function Header({ user, onSignOut }: HeaderProps) {
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 shadow-lg shadow-black/40 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Smart Bookmark
        </h1>
        <p className="mt-1 truncate text-xs text-slate-400">
          Signed in as{" "}
          <span className="font-medium">
            {user.email ?? user.user_metadata?.full_name}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-slate-950">
          {userInitial || "U"}
        </div>
        <button
          onClick={onSignOut}
          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
