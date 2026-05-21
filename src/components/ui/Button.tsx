import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-amber to-amber-deep text-white shadow-[0_8px_20px_rgba(240,125,16,.30)] hover:-translate-y-px",
  secondary:
    "border border-black/[.08] bg-white text-ink hover:shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
  ghost: "text-ink-dim hover:bg-black/[.04] dark:text-slate-400 dark:hover:bg-white/5",
  danger: "bg-brand-red text-white hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-sm",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
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
