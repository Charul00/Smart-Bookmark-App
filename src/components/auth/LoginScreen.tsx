type LoginScreenProps = {
  onSignIn: () => void;
  error: string | null;
};

export function LoginScreen({ onSignIn, error }: LoginScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-3 sm:px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-2xl shadow-black/50 sm:p-8">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500 text-xs font-semibold text-slate-950 sm:h-9 sm:w-9 sm:text-sm">
            SB
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
              Smart Bookmark
            </h1>
            <p className="text-[10px] text-slate-400 sm:text-[11px]">
              Clean, private, real-time bookmarks.
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-300 sm:text-sm">
          Sign in with Google to save and sync your bookmarks across devices.
        </p>
        <button
          onClick={onSignIn}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-100 shadow-sm transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:text-sm"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-4 w-4"
            >
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.2C12.43 13.02 17.74 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.07 24.55c0-1.57-.14-3.08-.39-4.55H24v9.04h12.45c-.54 2.77-2.12 5.12-4.47 6.7l7.24 5.62C43.59 37.32 46.07 31.39 46.07 24.55z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.98A14.48 14.48 0 019.5 24c0-1.73.31-3.39.86-4.98l-7.98-6.2C.83 16.05 0 19.43 0 23c0 3.49.8 6.79 2.22 9.75l8.32-3.77z"
              />
              <path
                fill="#EA4335"
                d="M24 47.5c6.48 0 11.93-2.13 15.9-5.79l-7.24-5.62C30.79 37.53 27.71 38.5 24 38.5c-6.26 0-11.57-3.52-14.46-8.72l-8.32 3.77C6.51 42.62 14.62 47.5 24 47.5z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </span>
          <span>Sign in with Google</span>
        </button>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          We only use Google for secure authentication. No passwords to
          remember.
        </p>
        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
