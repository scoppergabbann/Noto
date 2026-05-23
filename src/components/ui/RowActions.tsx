"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function RowActions({
  onEdit,
  onDelete,
  className,
}: {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      <button
        onClick={onEdit}
        aria-label="Edit"
        className={[
          "grid h-11 w-11 place-items-center rounded-xl text-ink-faint", // 44px
          "transition hover:bg-black/[.05] hover:text-ink",
          "active:bg-black/10 active:text-ink",
          "dark:hover:bg-white/10 dark:hover:text-slate-100",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
          "touch-manipulation",
        ].join(" ")}
      >
        <Pencil size={16} strokeWidth={2} />
      </button>
      <button
        onClick={onDelete}
        aria-label="Hapus"
        className={[
          "grid h-11 w-11 place-items-center rounded-xl text-ink-faint", // 44px
          "transition hover:bg-neg-soft hover:text-neg-strong",
          "active:bg-neg-soft active:text-neg-strong",
          "dark:hover:bg-neg/15 dark:hover:text-neg-dark",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-neg",
          "touch-manipulation",
        ].join(" ")}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
