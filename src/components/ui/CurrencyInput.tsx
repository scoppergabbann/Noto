"use client";

import { useRef } from "react";

interface Props {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

/** Format angka ke "10.000.000" (titik sebagai pemisah ribuan Indonesia) */
function formatRp(n: number): string {
  if (!n) return "";
  return n.toLocaleString("id-ID");
}

/** Parse "10.000.000" atau "10000000" → 10000000 */
function parseRp(s: string): number {
  return Number(s.replace(/\./g, "").replace(/,/g, "")) || 0;
}

export function CurrencyInput({ label, value, onChange, placeholder, hint, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, ""); // hanya digit
    const num = Number(raw) || 0;
    onChange(num);
  }

  return (
    <div>
      <label className="text-heading mb-1.5 block text-[13.5px] font-semibold">
        {label}
        {required && <span className="ml-1 text-neg">*</span>}
      </label>
      <div className="relative">
        <span className="text-subtle pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold">
          Rp
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatRp(value)}
          onChange={handleChange}
          placeholder={placeholder ?? "0"}
          className="text-heading placeholder:text-subtle w-full rounded-xl border border-black/[.08] bg-white py-2.5 pl-9 pr-4 text-[14.5px] font-semibold tabular-nums outline-none transition placeholder:font-normal focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      {hint && <p className="text-subtle mt-1 text-[12px]">{hint}</p>}
    </div>
  );
}
