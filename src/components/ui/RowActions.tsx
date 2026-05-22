"use client";

import { Pencil, Trash2 } from "lucide-react";

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-black/[.05] hover:text-ink dark:hover:bg-white/10 dark:hover:text-slate-100"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        aria-label="Hapus"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-brand-red/10 hover:text-brand-red"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
