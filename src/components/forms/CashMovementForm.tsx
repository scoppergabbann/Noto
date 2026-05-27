"use client";

import { useState } from "react";
import { createCashMovement } from "@/lib/actions/cash-movements";

type GoalOption = {
  id: string;
  item: string;
};

type CashMovementFormProps = {
  goals: GoalOption[];
  onSuccess?: () => void;
};

export function CashMovementForm({ goals, onSuccess }: CashMovementFormProps) {
  const [goalId, setGoalId] = useState(goals[0]?.id ?? "");
  const [type, setType] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [movementDate, setMovementDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      await createCashMovement({
        goalId: goalId || null,
        type,
        category: type === "in" ? "cash_in" : "cash_out",
        amount: Number(amount),
        movementDate,
        note,
      });

      setAmount("");
      setNote("");

      onSuccess?.();
    } catch (error) {
      console.error("[cash movement] gagal submit:", error);
      alert(error instanceof Error ? error.message : "Gagal menyimpan mutasi dana");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-[14px] font-medium text-heading outline-none transition placeholder:text-subtle focus:border-amber/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-amber/10 dark:[color-scheme:dark]";

  const labelClass = "mb-1.5 block text-[12.5px] font-bold text-heading";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Goal / Cash</label>
        <select
          value={goalId}
          onChange={(event) => setGoalId(event.target.value)}
          className={inputClass}
          required
        >
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Tipe</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as "in" | "out")}
          className={inputClass}
        >
          <option value="in">Tambah Dana</option>
          <option value="out">Tarik Dana</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Nominal</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-subtle">
            Rp
          </span>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            min={1}
            className={`${inputClass} pl-10`}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tanggal</label>
        <input
          type="date"
          value={movementDate}
          onChange={(event) => setMovementDate(event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Catatan</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Contoh: Gaji April"
          className="min-h-[96px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 text-[14px] font-medium text-heading outline-none transition placeholder:text-subtle focus:border-amber/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-amber/10"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || !goals.length}
          className="min-h-[42px] rounded-xl bg-amber px-5 text-[14px] font-bold text-white shadow-glow transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : type === "in" ? "Tambah Dana" : "Tarik Dana"}
        </button>
      </div>
    </form>
  );
}