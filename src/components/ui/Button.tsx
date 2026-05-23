import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-amber to-amber-deep text-white shadow-[0_8px_20px_rgba(240,125,16,.28)] hover:-translate-y-px active:translate-y-0 active:brightness-95",
  secondary:
    "border border-black/[.08] bg-white text-ink hover:shadow-soft active:bg-black/[.03] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:active:bg-white/10",
  ghost:
    "text-ink-dim hover:bg-black/[.04] active:bg-black/[.07] dark:text-slate-400 dark:hover:bg-white/5 dark:active:bg-white/10",
  danger: "bg-neg text-white hover:brightness-105 active:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[36px] px-3.5 py-2 text-[13px]",
  md: "min-h-[44px] px-4 py-2.5 text-[14px]",
  lg: "min-h-[48px] px-6 py-3 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "touch-manipulation", // prevents 300ms tap delay on mobile
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
