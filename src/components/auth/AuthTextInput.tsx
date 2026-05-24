"use client";

import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export function AuthTextInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  icon: Icon,
  showPassword,
  onTogglePassword,
  helper,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  icon: LucideIcon;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  helper?: string;
}) {
  const isPassword = Boolean(onTogglePassword);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-heading text-[13.5px] font-semibold">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="text-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />

        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-heading placeholder:text-subtle min-h-[50px] w-full touch-manipulation rounded-2xl border border-black/[.08] bg-white px-4 py-3 pl-11 pr-12 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />

        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="text-subtle absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl transition hover:bg-black/[.04] hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber dark:hover:bg-white/10"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {helper && <p className="text-subtle text-[12.5px]">{helper}</p>}
    </div>
  );
}