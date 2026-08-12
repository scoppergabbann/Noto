"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePrivacyStore } from "@/lib/store";

export function PrivacyToggle() {
  const { hideMoney, toggleMoney } = usePrivacyStore();
  const Icon = hideMoney ? EyeOff : Eye;

  function handleClick() {
    toggleMoney();
    window.setTimeout(() => {
      window.location.reload();
    }, 0);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={hideMoney ? "Tampilkan nominal" : "Sembunyikan nominal"}
      aria-label={hideMoney ? "Tampilkan nominal uang" : "Sembunyikan nominal uang"}
      aria-pressed={hideMoney}
      className="grid h-10 w-10 place-items-center rounded-xl border border-black/[.08] bg-white text-ink-dim transition hover:shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
    >
      <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
