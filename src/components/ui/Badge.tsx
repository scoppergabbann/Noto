import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "red" | "amber" | "indigo";

const tones: Record<Tone, string> = {
  neutral: "bg-black/[.06] text-ink-dim dark:bg-white/10 dark:text-slate-300",
  green: "bg-brand-green/10 text-brand-green",
  red: "bg-brand-red/10 text-brand-red",
  amber: "bg-amber/15 text-amber-text dark:text-amber",
  indigo: "bg-brand-indigo/10 text-brand-indigo",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
