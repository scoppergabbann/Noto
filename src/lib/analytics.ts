// ---- Phase 9: analytics engine (pure functions over transactions) ----
import type { Transaction } from "@/types";

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-02" dari sebuah transaksi. */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** Label "Feb 2026" dari "2026-02". */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS_ID[Number(m) - 1]} ${y}`;
}

/** Label pendek "Feb" dari "2026-02". */
export function monthShort(key: string): string {
  return MONTHS_ID[Number(key.split("-")[1]) - 1];
}

/** Daftar bulan unik yang ada di transaksi, urut menaik. */
export function availableMonths(txs: Transaction[]): string[] {
  return Array.from(new Set(txs.map((t) => monthKey(t.date)))).sort();
}

/** Filter transaksi untuk satu bulan (key "YYYY-MM"). */
export function txInMonth(txs: Transaction[], key: string): Transaction[] {
  return txs.filter((t) => monthKey(t.date) === key);
}

export function sumByType(txs: Transaction[], type: "income" | "expense"): number {
  return txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

/** Total per kategori untuk type tertentu, urut desc. */
export function byCategory(
  txs: Transaction[],
  type: "income" | "expense"
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  txs
    .filter((t) => t.type === type)
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** Seri arus kas bulanan (income vs expense) untuk N bulan terakhir. */
export function cashflowSeries(
  txs: Transaction[],
  lastN = 6
): { month: string; income: number; expense: number }[] {
  const months = availableMonths(txs).slice(-lastN);
  return months.map((key) => {
    const m = txInMonth(txs, key);
    return {
      month: monthShort(key),
      income: Math.round(sumByType(m, "income") / 1e6),
      expense: Math.round(sumByType(m, "expense") / 1e6),
    };
  });
}

/** Persentase perubahan bulan-ke-bulan; null jika tidak ada pembanding. */
export function momChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export interface MonthInsight {
  income: number;
  expense: number;
  saved: number;
  savingsRate: number; // %
  topCategory: { name: string; value: number } | null;
  expenseChange: number | null; // % vs bulan sebelumnya
}

/** Ringkasan + insight untuk satu bulan, dibandingkan bulan sebelumnya. */
export function monthInsight(txs: Transaction[], key: string): MonthInsight {
  const months = availableMonths(txs);
  const idx = months.indexOf(key);
  const cur = txInMonth(txs, key);
  const income = sumByType(cur, "income");
  const expense = sumByType(cur, "expense");
  const saved = income - expense;
  const cats = byCategory(cur, "expense");

  let expenseChange: number | null = null;
  if (idx > 0) {
    const prevExpense = sumByType(txInMonth(txs, months[idx - 1]), "expense");
    expenseChange = momChange(expense, prevExpense);
  }

  return {
    income,
    expense,
    saved,
    savingsRate: income > 0 ? Math.round((saved / income) * 100) : 0,
    topCategory: cats[0] ?? null,
    expenseChange,
  };
}
