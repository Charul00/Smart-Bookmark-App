export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-3 sm:px-4">
      <div className="text-center text-slate-100">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Smart Bookmark App
        </h1>
        <p className="mt-2 text-xs text-slate-400 sm:text-sm">
          Loading your workspace…
        </p>
      </div>
    </div>
  );
}
