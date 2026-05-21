import { cn } from "@/lib/utils";

export function Select({
  label,
  className,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-dim dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "rounded-xl border border-black/[.10] bg-white px-3.5 py-2.5 text-sm outline-none transition",
          "focus:border-amber focus:ring-2 focus:ring-amber/20",
          "dark:border-white/10 dark:bg-white/5",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
