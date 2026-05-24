"use client";

type GoogleAuthButtonProps = {
  label: string;
  loading?: boolean;
  onClick: () => void;
};

export function GoogleAuthButton({ label, loading, onClick }: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex min-h-[50px] w-full touch-manipulation items-center justify-center gap-3 rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[15px] font-bold text-heading shadow-sm transition hover:-translate-y-px hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/[.06] dark:text-white dark:hover:bg-white/[.09]"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[15px] font-black text-[#4285F4]">
        G
      </span>
      {loading ? "Mengarahkan…" : label}
    </button>
  );
}