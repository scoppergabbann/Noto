"use client";

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      <span className="text-subtle text-[12px] font-semibold">{label}</span>
      <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
    </div>
  );
}