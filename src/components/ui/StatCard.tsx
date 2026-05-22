import { Card } from "./Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "green",
  sub,
  icon,
  iconClass,
  dark,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "green" | "red";
  sub?: string;
  icon?: React.ReactNode;
  iconClass?: string;
  dark?: boolean;
}) {
  return (
    <Card
      hoverable
      className={cn(
        dark && "!border-transparent !bg-gradient-to-br from-ink to-[#26262e] text-white"
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            "text-[13.5px] font-medium",
            dark ? "text-white/60" : "text-ink-dim dark:text-slate-400"
          )}
        >
          {label}
        </div>
        {icon && (
          <div
            className={cn("grid h-[38px] w-[38px] place-items-center rounded-[11px]", iconClass)}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "font-serif text-[30px] font-semibold leading-none tracking-tight",
          dark && "text-white"
        )}
      >
        {value}
      </div>
      {(delta || sub) && (
        <div className="mt-[11px] flex items-center gap-1.5 text-[13px] font-medium">
          {delta && (
            <span
              className={cn(
                "rounded-lg px-2 py-0.5 text-[12.5px] font-semibold",
                deltaTone === "green"
                  ? "bg-brand-green/10 text-brand-green"
                  : "bg-brand-red/10 text-brand-red",
                dark && deltaTone === "green" && "bg-brand-green/25 text-emerald-300"
              )}
            >
              {delta}
            </span>
          )}
          {sub && (
            <span className={dark ? "text-white/60" : "text-ink-dim dark:text-slate-400"}>
              {sub}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
