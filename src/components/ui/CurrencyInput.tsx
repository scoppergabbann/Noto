"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function formatRp(n: number): string {
  if (!n) return "";
  return n.toLocaleString("id-ID");
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
  className,
}: Props) {
  const id = useId();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    onChange(Number(raw) || 0);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-heading text-[13.5px] font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-neg" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(wajib diisi)</span>}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="text-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold"
        >
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatRp(value)}
          onChange={handleChange}
          placeholder={placeholder ?? "0"}
          aria-label={`${label} dalam Rupiah`}
          className={cn(
            "min-h-[44px] w-full rounded-xl border py-3 pl-11 pr-4",
            "text-heading text-[15px] font-semibold tabular-nums",
            "bg-white outline-none transition-all",
            "placeholder:text-subtle placeholder:font-normal",
            error
              ? "border-neg focus:border-neg focus:ring-2 focus:ring-neg/20"
              : "border-black/[.08] focus:border-amber focus:ring-2 focus:ring-amber/20",
            "dark:border-white/10 dark:bg-white/5 dark:text-white",
            "touch-manipulation",
            "sm:text-[14.5px]"
          )}
        />
      </div>
      {hint && !error && <span className="text-subtle text-[12.5px]">{hint}</span>}
      {error && (
        <span className="text-[12.5px] font-medium text-neg-strong dark:text-neg-dark" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
