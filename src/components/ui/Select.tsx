import { cn } from "@/lib/utils";
import { useId } from "react";

export function Select({
  label,
  hint,
  error,
  className,
  id: idProp,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-heading text-[13.5px] font-semibold">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "text-heading min-h-[44px] w-full appearance-none rounded-xl border px-4 py-3 text-[15px]",
          "bg-white outline-none transition-all",
          error
            ? "border-neg focus:border-neg focus:ring-2 focus:ring-neg/20"
            : "border-black/[.10] focus:border-amber focus:ring-2 focus:ring-amber/20",
          "dark:border-white/10 dark:bg-[#1b1f28] dark:text-white",
          "touch-manipulation sm:text-[14.5px]",
          // Custom arrow
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[right_12px_center] bg-no-repeat pr-10",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="text-subtle text-[12.5px]">{hint}</span>}
      {error && (
        <span className="text-[12.5px] font-medium text-neg-strong dark:text-neg-dark" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
