import { cn } from "@/lib/utils";

export function Input({
  label,
  hint,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-dim dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-xl border border-black/[.10] bg-white px-3.5 py-2.5 text-sm outline-none transition",
          "placeholder:text-ink-faint focus:border-amber focus:ring-2 focus:ring-amber/20",
          "dark:border-white/10 dark:bg-white/5",
          className
        )}
        {...props}
      />
      {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
    </div>
  );
}
