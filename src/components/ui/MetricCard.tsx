import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
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
            "text-[13px] font-semibold tracking-wide",
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
              "inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-[12.5px] font-bold tabular-nums",
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
        <div className="relative z-10 mt-4 h-10 w-full opacity-90">
          <Sparkline data={spark} color={hero ? "#a5b4fc" : sparkColor} id={id} />
        </div>
      )}
    </div>
  );
}
