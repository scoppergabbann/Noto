"use client";

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#E8EAEE] dark:bg-white/10" />
      <span className="text-[12px] font-semibold text-[#858C97]">{label}</span>
      <div className="h-px flex-1 bg-[#E8EAEE] dark:bg-white/10" />
    </div>
  );
}
