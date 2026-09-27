export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-black/10 border-t-[#275E9D] dark:border-white/10 dark:border-t-blue-300"
        aria-hidden="true"
      />
      <div className="text-muted text-[14px] font-medium">{label}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
      role="alert"
    >
      <div className="mb-3 text-[44px]" aria-hidden="true">
        ⚠️
      </div>
      <div className="mb-2 text-[18px] font-bold text-[#18202B] dark:text-white">
        Gagal memuat data
      </div>
      <div className="text-muted mb-6 max-w-xs px-4 text-[14px] leading-relaxed">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="min-h-[44px] touch-manipulation rounded-xl bg-[#081F4D] px-6 py-3 text-[14px] font-bold text-white shadow-glow transition hover:bg-[#12396D] active:brightness-95"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
