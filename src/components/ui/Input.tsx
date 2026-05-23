import { cn } from "@/lib/utils";
import { useId } from "react";

export function Input({
  label,
  hint,
  error,
  className,
  id: idProp,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
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
      <input
        id={id}
        className={cn(
          // Mobile: min 44px height, larger text, proper padding
          "text-heading min-h-[44px] w-full rounded-xl border px-4 py-3 text-[15px]",
          "bg-white outline-none transition-all",
          "placeholder:text-subtle",
          // Border states
          error
            ? "border-neg focus:border-neg focus:ring-2 focus:ring-neg/20"
            : "border-black/[.10] focus:border-amber focus:ring-2 focus:ring-amber/20",
          // Dark mode
          "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30",
          // Active state
          "active:border-amber",
          // Prevent zoom on iOS (font-size >= 16px)
          "sm:text-[14.5px]",
          // Touch
          "touch-manipulation",
          className
        )}
        {...props}
      />
      {hint && !error && <span className="text-subtle text-[12.5px]">{hint}</span>}
      {error && (
        <span className="text-[12.5px] font-medium text-neg-strong dark:text-neg-dark" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
