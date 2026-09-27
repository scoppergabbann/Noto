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
      className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-3 rounded-2xl border border-[#E8EAEE] bg-white px-4 py-3 text-[15px] font-bold text-[#18202B] shadow-[0_4px_14px_rgba(16,24,40,.05)] transition hover:-translate-y-px hover:bg-[#F7F7F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#275E9D] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/[.06] dark:text-white dark:hover:bg-white/[.09]"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[15px] font-black text-[#4285F4]">
        G
      </span>
      {loading ? "Mengarahkan…" : label}
    </button>
  );
}
