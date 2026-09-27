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
  tone = "blue",
  progress,
  className,
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
  tone?: "blue" | "cream" | "gray";
  progress?: number;
  className?: string;
  id: string;
}) {
  const TrendIcon = trendDir === "up" ? ArrowUpRight : ArrowDownRight;
  const toneStyles = {
    blue: "border-[#DDE8FA] bg-[#EEF4FF]",
    cream: "border-[#F5E4C9] bg-[#FFF6E9]",
    gray: "border-[#E4E6EA] bg-[#F0F1F3]",
  };
  const toneAccent = {
    blue: "#275E9D",
    cream: "#E59A39",
    gray: "#5E6570",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5",
        hero
          ? "rounded-[30px] border border-white/10 p-6 text-white shadow-[0_18px_44px_rgba(8,31,77,.18)] sm:p-7"
          : cn(
              "rounded-[22px] border p-4 shadow-[0_8px_24px_rgba(16,24,40,.05)] sm:p-5",
              toneStyles[tone],
              "dark:border-white/10 dark:bg-night-raised"
            ),
        className
      )}
      style={
        hero
          ? {
              background: "linear-gradient(135deg, #081F4D 0%, #12396D 58%, #275E9D 100%)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "relative z-10 flex items-start justify-between",
          !hero && "flex-col gap-3 sm:flex-row sm:gap-2"
        )}
      >
        <span
          className={cn(
            "text-[11px] font-bold sm:text-[13px]",
            hero ? "text-white/75" : "text-[#59616D] dark:text-slate-400"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl sm:h-9 sm:w-9",
            hero
              ? "bg-white/10 text-white"
              : "bg-white text-[#18202B] shadow-[0_3px_12px_rgba(16,24,40,.08)] dark:bg-white/10 dark:text-white"
          )}
        >
          <Icon size={18} strokeWidth={2.2} />
        </span>
      </div>

      <div
        className={cn(
          "relative z-10 mt-4 font-sans font-bold tabular-nums leading-none",
          hero
            ? "text-[34px] text-white sm:text-[42px]"
            : "text-[18px] text-[#18202B] sm:text-[24px]",
          !hero && "break-words dark:text-white"
        )}
      >
        {value}
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-bold tabular-nums sm:px-2 sm:text-[12px]",
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
          <Sparkline data={spark} color={hero ? "#FFFFFF" : sparkColor} id={id} />
        </div>
      )}

      {progress !== undefined && !hero && (
        <div className="relative z-10 mt-4 h-2 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
          <span
            className="block h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: toneAccent[tone],
            }}
          />
        </div>
      )}

      {formula && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 translate-y-2 rounded-xl border border-white/10 bg-ink/95 px-3 py-2 text-[12px] font-semibold leading-relaxed text-white opacity-0 shadow-softlg backdrop-blur transition duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white/95 dark:text-ink">
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
