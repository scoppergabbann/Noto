import { ArrowUpRight, ArrowDownRight, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/Sparkline";

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDir = "up",
  trendGood = true,
  caption,
  spark,
  sparkColor = "#0f9d6b",
  formula,
  hero = false,
  id,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendDir?: "up" | "down";
  trendGood?: boolean;
  caption?: string;
  spark?: number[];
  sparkColor?: string;
  formula?: string;
  hero?: boolean;
  id: string;
}) {
  const TrendIcon = trendDir === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl3 p-6 transition-all duration-200 hover:-translate-y-0.5",
        hero
          ? "border border-transparent text-white shadow-[0_20px_48px_rgba(16,18,24,.18)]"
          : "card hoverable"
      )}
      style={
        hero
          ? {
              background: "linear-gradient(135deg, #1a1d27 0%, #232838 55%, #2a2150 100%)",
            }
          : undefined
      }
    >
      {/* hero glow */}
      {hero && (
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <span
          className={cn(
            "text-[12px] font-semibold tracking-wide sm:text-[13px]",
            hero ? "text-white/70" : "text-muted"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl",
            hero
              ? "bg-white/10 text-white"
              : "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber"
          )}
        >
          <Icon size={18} strokeWidth={2.2} />
        </span>
      </div>

      <div
        className={cn(
          "relative z-10 mt-3 font-serif text-[32px] font-semibold tabular-nums leading-none tracking-tight",
          hero ? "text-white" : "text-heading"
        )}
      >
        {value}
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-[12px] font-bold tabular-nums sm:text-[12.5px]",
              hero
                ? trendGood
                  ? "bg-pos-dark/20 text-pos-dark"
                  : "bg-neg-dark/20 text-neg-dark"
                : trendGood
                  ? "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                  : "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
            )}
          >
            <TrendIcon size={13} strokeWidth={2.6} />
            {trend}
          </span>
        )}
        {caption && (
          <span className={cn("text-[12.5px] font-medium", hero ? "text-white/60" : "text-subtle")}>
            {caption}
          </span>
        )}
      </div>

      {spark && (
        <div className="relative z-10 mt-3 h-9 w-full opacity-90 sm:h-10">
          <Sparkline data={spark} color={hero ? "#a5b4fc" : sparkColor} id={id} />
        </div>
      )}

      {formula && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 translate-y-2 rounded-xl border border-white/10 bg-ink/95 px-3 py-2 text-[12px] font-semibold leading-relaxed text-white opacity-0 shadow-softlg backdrop-blur transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:bg-white/95 dark:text-ink">
          <div className="mb-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[.08em] opacity-70">
            <Info size={12} strokeWidth={2.5} />
            Rumus
          </div>
          {formula}
        </div>
      )}
    </div>
  );
}
