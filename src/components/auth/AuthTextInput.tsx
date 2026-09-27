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
      <label htmlFor={id} className="text-[13.5px] font-bold text-[#18202B] dark:text-white">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#858C97]"
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
          className="min-h-[52px] w-full touch-manipulation rounded-2xl border border-[#E8EAEE] bg-[#F7F7F9] px-4 py-3 pl-11 pr-12 text-[15px] font-medium text-[#18202B] outline-none transition placeholder:text-[#A2A8B1] focus:border-[#275E9D] focus:bg-white focus:ring-2 focus:ring-[#275E9D]/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />

        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-[#858C97] transition hover:bg-black/[.04] hover:text-[#18202B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#275E9D] dark:hover:bg-white/10 dark:hover:text-white"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {helper && <p className="text-[12.5px] text-[#858C97]">{helper}</p>}
    </div>
  );
}
