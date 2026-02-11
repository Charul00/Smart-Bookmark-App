import type { Toast as ToastType } from "@/types";

type ToastProps = {
  toast: ToastType;
};

export function Toast({ toast }: ToastProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right sm:gap-3 sm:px-4 sm:py-3 ${
        toast.type === "success"
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
          : "border-red-500/50 bg-red-500/10 text-red-100"
      }`}
    >
      {toast.type === "success" ? (
        <svg
          className="h-4 w-4 shrink-0 text-emerald-400 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 shrink-0 text-red-400 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      <span className="break-words text-xs font-medium sm:text-sm">
        {toast.message}
      </span>
    </div>
  );
}

type ToastContainerProps = {
  toasts: ToastType[];
};

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed right-2 top-2 z-50 flex max-w-[calc(100vw-1rem)] flex-col gap-2 sm:right-4 sm:top-4 sm:max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
