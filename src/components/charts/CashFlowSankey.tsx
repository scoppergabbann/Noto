"use client";

import { ArrowRight, PiggyBank, ReceiptText, Wallet } from "lucide-react";
import { rpShort } from "@/lib/format";
import type { Transaction } from "@/types";

type ExpenseItem = {
  name: string;
  value: number;
};

function buildExpenseBreakdown(transactions: Transaction[]): ExpenseItem[] {
  const map = new Map<string, number>();

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function CashFlowSankey({ transactions }: { transactions: Transaction[] }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = buildExpenseBreakdown(transactions);
  const totalExpense = expenses.reduce((sum, item) => sum + item.value, 0);
  const savings = Math.max(0, income - totalExpense);
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const expenseRate = income > 0 ? Math.round((totalExpense / income) * 100) : 0;

  if (income <= 0 && totalExpense <= 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-surface-sunken text-center dark:bg-white/5">
        <div>
          <div className="mb-2 text-[32px]">🌊</div>
          <p className="text-muted text-[14px]">
            Belum cukup data untuk membaca alur cash flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-sunken p-4 dark:bg-white/5 sm:p-5">
      {/* Flow cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
        {/* Income */}
        <div className="rounded-2xl border border-black/[.06] bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pos/15 text-pos-strong dark:text-pos-dark">
              <Wallet size={18} />
            </span>
            <div>
              <div className="text-subtle text-[12px] font-bold uppercase tracking-wide">
                Pemasukan
              </div>
              <div className="text-heading font-serif text-[22px] font-bold tabular-nums">
                {rpShort(income)}
              </div>
            </div>
          </div>
          <p className="text-muted text-[13px]">
            Total uang masuk pada bulan ini.
          </p>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <ArrowRight className="text-muted" size={22} />
        </div>

        {/* Allocation */}
        <div className="rounded-2xl border border-amber/20 bg-amber-soft/50 p-4 dark:bg-amber/[0.08]">
          <div className="mb-3">
            <div className="text-subtle text-[12px] font-bold uppercase tracking-wide">
              Dialokasikan
            </div>
            <div className="text-heading font-serif text-[22px] font-bold tabular-nums">
              {rpShort(income)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span className="text-body font-semibold">Ditabung</span>
                <span className="text-pos-strong font-bold dark:text-pos-dark">
                  {savingsRate}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-pos"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span className="text-body font-semibold">Pengeluaran</span>
                <span className="text-neg-strong font-bold dark:text-neg-dark">
                  {expenseRate}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-neg"
                  style={{ width: `${Math.min(100, Math.max(0, expenseRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <ArrowRight className="text-muted" size={22} />
        </div>

        {/* Result */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-pos/15 bg-pos-soft/50 p-4 dark:bg-pos/[0.08]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pos/15 text-pos-strong dark:text-pos-dark">
                <PiggyBank size={18} />
              </span>
              <div>
                <div className="text-subtle text-[12px] font-bold uppercase tracking-wide">
                  Ditabung
                </div>
                <div className="text-heading font-serif text-[20px] font-bold tabular-nums">
                  {rpShort(savings)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neg/15 bg-neg-soft/50 p-4 dark:bg-neg/[0.08]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-neg/15 text-neg-strong dark:text-neg-dark">
                <ReceiptText size={18} />
              </span>
              <div>
                <div className="text-subtle text-[12px] font-bold uppercase tracking-wide">
                  Pengeluaran
                </div>
                <div className="text-heading font-serif text-[20px] font-bold tabular-nums">
                  {rpShort(totalExpense)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="mt-4 rounded-2xl border border-black/[.06] bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-heading font-serif text-[16px] font-semibold">
              Pengeluaran terbesar
            </div>
            <div className="text-muted text-[12.5px]">
              Kategori yang paling banyak menyerap cash flow.
            </div>
          </div>
          <div className="text-muted text-[12.5px] font-semibold">
            {expenses.length} kategori
          </div>
        </div>

        {expenses.length === 0 ? (
          <p className="py-5 text-center text-[13.5px] text-muted">
            Belum ada pengeluaran bulan ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.slice(0, 5).map((item) => {
              const percent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;

              return (
                <li key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-body font-semibold">{item.name}</span>
                    <span className="text-heading font-bold tabular-nums">
                      {rpShort(item.value)} · {percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}