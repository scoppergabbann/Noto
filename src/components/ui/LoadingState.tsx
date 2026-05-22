export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-black/10 border-t-amber dark:border-white/10 dark:border-t-amber" />
      <div className="text-muted text-[14px] font-medium">{label}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 text-[40px]">⚠️</div>
      <div className="text-heading mb-1.5 font-serif text-[18px] font-semibold">
        Gagal memuat data
      </div>
      <div className="text-muted mb-5 max-w-xs text-[13.5px]">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-gradient-to-br from-amber to-amber-deep px-5 py-2.5 text-[14px] font-bold text-white shadow-glow transition hover:brightness-105"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
