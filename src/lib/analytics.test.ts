import { describe, it, expect } from "vitest";
import {
  monthKey,
  monthLabel,
  monthShort,
  availableMonths,
  txInMonth,
  sumByType,
  byCategory,
  cashflowSeries,
  momChange,
  monthInsight,
} from "./analytics";
import type { Transaction } from "@/types";

const txs: Transaction[] = [
  { id: "1", type: "income", category: "Gaji", amount: 15_000_000, date: "2026-02-01" },
  { id: "2", type: "income", category: "Freelance", amount: 2_200_000, date: "2026-02-14" },
  { id: "3", type: "expense", category: "Makan & Minum", amount: 3_200_000, date: "2026-02-05" },
  { id: "4", type: "expense", category: "Tagihan", amount: 2_400_000, date: "2026-02-05" },
  { id: "5", type: "expense", category: "Belanja", amount: 1_800_000, date: "2026-02-12" },
  { id: "6", type: "expense", category: "Makan & Minum", amount: 800_000, date: "2026-02-20" },
  // Januari (pembanding)
  { id: "7", type: "income", category: "Gaji", amount: 15_000_000, date: "2026-01-01" },
  { id: "8", type: "expense", category: "Belanja", amount: 5_000_000, date: "2026-01-15" },
];

describe("month helpers", () => {
  it("monthKey ambil YYYY-MM", () => {
    expect(monthKey("2026-02-14")).toBe("2026-02");
  });
  it("monthLabel format Indonesia", () => {
    expect(monthLabel("2026-02")).toBe("Feb 2026");
    expect(monthLabel("2025-12")).toBe("Des 2025");
  });
  it("monthShort nama bulan", () => {
    expect(monthShort("2026-05")).toBe("Mei");
  });
});

describe("availableMonths", () => {
  it("unik & terurut menaik", () => {
    expect(availableMonths(txs)).toEqual(["2026-01", "2026-02"]);
  });
  it("array kosong → []", () => {
    expect(availableMonths([])).toEqual([]);
  });
});

describe("txInMonth & sumByType", () => {
  it("filter transaksi per bulan", () => {
    expect(txInMonth(txs, "2026-02")).toHaveLength(6);
    expect(txInMonth(txs, "2026-01")).toHaveLength(2);
  });
  it("jumlahkan per tipe", () => {
    const feb = txInMonth(txs, "2026-02");
    expect(sumByType(feb, "income")).toBe(17_200_000);
    expect(sumByType(feb, "expense")).toBe(8_200_000);
  });
});

describe("byCategory", () => {
  it("agregasi & urut desc, gabung kategori sama", () => {
    const feb = txInMonth(txs, "2026-02");
    const cats = byCategory(feb, "expense");
    expect(cats[0]).toEqual({ name: "Makan & Minum", value: 4_000_000 }); // 3.2 + 0.8
    expect(cats[1]).toEqual({ name: "Tagihan", value: 2_400_000 });
    expect(cats[2]).toEqual({ name: "Belanja", value: 1_800_000 });
  });
});

describe("momChange", () => {
  it("persentase perubahan", () => {
    expect(momChange(110, 100)).toBe(10);
    expect(momChange(80, 100)).toBe(-20);
  });
  it("pembanding 0 → null", () => {
    expect(momChange(100, 0)).toBeNull();
  });
});

describe("cashflowSeries", () => {
  it("seri bulanan dalam juta", () => {
    const s = cashflowSeries(txs, 6);
    expect(s).toEqual([
      { month: "Jan", income: 15, expense: 5 },
      { month: "Feb", income: 17, expense: 8 },
    ]);
  });
  it("batasi N bulan terakhir", () => {
    expect(cashflowSeries(txs, 1)).toHaveLength(1);
    expect(cashflowSeries(txs, 1)[0].month).toBe("Feb");
  });
});

describe("monthInsight", () => {
  it("ringkasan + insight Feb lengkap", () => {
    const ins = monthInsight(txs, "2026-02");
    expect(ins.income).toBe(17_200_000);
    expect(ins.expense).toBe(8_200_000);
    expect(ins.saved).toBe(9_000_000);
    expect(ins.savingsRate).toBe(52); // 9/17.2 ≈ 52%
    expect(ins.topCategory).toEqual({ name: "Makan & Minum", value: 4_000_000 });
    // Feb expense 8.2jt vs Jan 5jt → +64%
    expect(ins.expenseChange).toBe(64);
  });
  it("bulan pertama → expenseChange null (tak ada pembanding)", () => {
    const ins = monthInsight(txs, "2026-01");
    expect(ins.expenseChange).toBeNull();
  });
  it("income 0 → savingsRate 0 (guard)", () => {
    const onlyExpense: Transaction[] = [
      { id: "x", type: "expense", category: "Belanja", amount: 1_000_000, date: "2026-03-01" },
    ];
    expect(monthInsight(onlyExpense, "2026-03").savingsRate).toBe(0);
  });
  it("tanpa pengeluaran → topCategory null", () => {
    const onlyIncome: Transaction[] = [
      { id: "y", type: "income", category: "Gaji", amount: 5_000_000, date: "2026-04-01" },
    ];
    const ins = monthInsight(onlyIncome, "2026-04");
    expect(ins.topCategory).toBeNull();
    expect(ins.savingsRate).toBe(100);
  });
});
