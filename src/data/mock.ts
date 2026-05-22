import type {
  Goal,
  CreditCard,
  SpendingCategory,
  SummaryRow,
  NetWorthPoint,
  CashFlowPoint,
} from "@/types";

export const goals: Goal[] = [
  {
    id: "g1",
    item: "Dana Darurat",
    instrument: "Bank Jago",
    targetAmount: 30_000_000,
    usedAmount: 18_500_000,
    deadline: "Des 2026",
    durationMonths: 10,
    color: "#1f9e6f",
    emoji: "🛡️",
  },
  {
    id: "g2",
    item: "Liburan Jepang",
    instrument: "Reksadana",
    targetAmount: 25_000_000,
    usedAmount: 9_000_000,
    deadline: "Okt 2026",
    durationMonths: 8,
    color: "#6b6ff0",
    emoji: "🗾",
  },
  {
    id: "g3",
    item: "DP Motor",
    instrument: "Deposito",
    targetAmount: 15_000_000,
    usedAmount: 13_200_000,
    deadline: "Jun 2026",
    durationMonths: 3,
    color: "#ff9d2e",
    emoji: "🛵",
  },
];

export const creditCards: CreditCard[] = [
  {
    id: "c1",
    name: "BCA Mastercard",
    creditLimit: 25_000_000,
    spent: 19_400_000,
    paid: 6_000_000,
    gradient: "linear-gradient(135deg,#3a3f8f,#6b6ff0)",
    last4: "4821",
  },
  {
    id: "c2",
    name: "Jenius Visa",
    creditLimit: 15_000_000,
    spent: 4_200_000,
    paid: 4_200_000,
    gradient: "linear-gradient(135deg,#0d6e4f,#1f9e6f)",
    last4: "9034",
  },
];

export const spending: SpendingCategory[] = [
  { name: "Makan & Minum", value: 3_200_000, color: "#6b6ff0" },
  { name: "Tagihan", value: 2_400_000, color: "#ff9d2e" },
  { name: "Belanja", value: 1_800_000, color: "#e0524a" },
  { name: "Hiburan", value: 1_300_000, color: "#1f9e6f" },
  { name: "Transport", value: 1_100_000, color: "#9a9ea9" },
];

export const summaryRows: SummaryRow[] = [
  { label: "Saldo saat ini (cash + aset)", value: "Rp133,0jt", tone: "" },
  { label: "Total pemasukan", value: "+Rp17,2jt", tone: "green" },
  { label: "Total pengeluaran", value: "−Rp9,8jt", tone: "red" },
  { label: "Tagihan dibayar", value: "Rp2,4jt", tone: "" },
  { label: "Sinking fund disisihkan", value: "Rp1,5jt", tone: "" },
  { label: "Investasi / tabungan", value: "Rp4,2jt", tone: "green" },
  { label: "Cicilan / utang dibayar", value: "Rp3,1jt", tone: "red" },
  { label: "Piutang masuk", value: "+Rp2,4jt", tone: "green" },
];

export const netWorthSeries: NetWorthPoint[] = [
  { month: "Jul", asset: 82, liability: 41 },
  { month: "Agu", asset: 88, liability: 39 },
  { month: "Sep", asset: 91, liability: 36 },
  { month: "Okt", asset: 99, liability: 34 },
  { month: "Nov", asset: 108, liability: 31 },
  { month: "Des", asset: 117, liability: 29 },
  { month: "Jan", asset: 124, liability: 27 },
  { month: "Feb", asset: 133, liability: 25 },
];

export const cashFlowSeries: CashFlowPoint[] = [
  { month: "Sep", income: 14, spend: 9.4 },
  { month: "Okt", income: 14, spend: 8.1 },
  { month: "Nov", income: 16.5, spend: 10.2 },
  { month: "Des", income: 18, spend: 12.6 },
  { month: "Jan", income: 15, spend: 8.9 },
  { month: "Feb", income: 17.2, spend: 9.8 },
];

export const assetComposition = [
  { name: "Tabungan", value: 41, color: "#6b6ff0" },
  { name: "Emas", value: 24, color: "#1f9e6f" },
  { name: "Investasi", value: 21, color: "#ff9d2e" },
  { name: "Lainnya", value: 14, color: "#9a9ea9" },
];

// ---- Phase 4 data ----
import type { Receivable, Debt, GoldAsset, OtherAsset } from "@/types";

export const receivables: Receivable[] = [
  {
    id: "r1",
    item: "Pinjaman ke Andi",
    debtor: "Andi",
    total: 5_000_000,
    paid: 2_000_000,
    dueDate: "",
    notes: "",
  },
  {
    id: "r2",
    item: "Patungan trip Bali",
    debtor: "Tim",
    total: 2_400_000,
    paid: 2_400_000,
    dueDate: "",
    notes: "",
  },
  {
    id: "r3",
    item: "Talangan Rina",
    debtor: "Rina",
    total: 1_500_000,
    paid: 0,
    dueDate: "",
    notes: "",
  },
];

export const debts: Debt[] = [
  {
    id: "d1",
    item: "KPR Apartemen",
    creditor: "Bank BCA",
    total: 320_000_000,
    paid: 95_000_000,
    dueDate: "tgl 5",
    notes: "",
  },
  {
    id: "d2",
    item: "Cicilan Laptop",
    creditor: "Akulaku",
    total: 18_000_000,
    paid: 12_000_000,
    dueDate: "tgl 20",
    notes: "",
  },
  {
    id: "d3",
    item: "Paylater Tokopedia",
    creditor: "Tokopedia",
    total: 3_200_000,
    paid: 1_100_000,
    dueDate: "tgl 28",
    notes: "",
  },
];

export const goldAssets: GoldAsset[] = [
  {
    id: "au1",
    item: "Emas Antam",
    category: "investment",
    boughtGrams: 15,
    soldGrams: 2,
    buyValue: 16_500_000,
    usedValue: 2_400_000,
    currentPricePerGram: 1_350_000,
    notes: "Beli bertahap 2024–2025",
  },
  {
    id: "au2",
    item: "Tabungan Emas Pegadaian",
    category: "savings",
    boughtGrams: 8.5,
    soldGrams: 0,
    buyValue: 9_200_000,
    usedValue: 0,
    currentPricePerGram: 1_350_000,
    notes: "Nabung rutin bulanan",
  },
];

export const goldValueSeries = [
  { month: "Sep", value: 13.1 },
  { month: "Okt", value: 13.6 },
  { month: "Nov", value: 14.2 },
  { month: "Des", value: 14.0 },
  { month: "Jan", value: 15.1 },
  { month: "Feb", value: 16.3 },
];

export const otherAssets: OtherAsset[] = [
  {
    id: "o1",
    item: "Motor Vario",
    unit: "unit",
    quantity: 1,
    currentValue: 18_000_000,
    emoji: "🛵",
  },
  { id: "o2", item: "iPhone 14", unit: "unit", quantity: 1, currentValue: 9_000_000, emoji: "📱" },
  {
    id: "o3",
    item: "Saham (portofolio)",
    unit: "lot",
    quantity: 42,
    currentValue: 21_000_000,
    emoji: "📈",
  },
];

// ---- Phase 9: transactions ----
import type { Transaction } from "@/types";

export const expenseCategories = [
  { name: "Makan & Minum", color: "#6366f1", emoji: "🍜" },
  { name: "Transport", color: "#0ea5e9", emoji: "🚌" },
  { name: "Tagihan", color: "#f59425", emoji: "🧾" },
  { name: "Hiburan", color: "#0f9d6b", emoji: "🎬" },
  { name: "Belanja", color: "#d83a3a", emoji: "🛍️" },
  { name: "Kesehatan", color: "#a855f7", emoji: "💊" },
  { name: "Lainnya", color: "#64748b", emoji: "📦" },
];

export const incomeCategories = [
  { name: "Gaji", color: "#0f9d6b", emoji: "💼" },
  { name: "Bonus", color: "#f59425", emoji: "🎁" },
  { name: "Freelance", color: "#6366f1", emoji: "💻" },
  { name: "Investasi", color: "#0ea5e9", emoji: "📈" },
  { name: "Lainnya", color: "#64748b", emoji: "💰" },
];

// Seed: beberapa bulan transaksi agar analytics terasa hidup
export const transactions: Transaction[] = [
  // Februari 2026
  {
    id: "t1",
    type: "income",
    category: "Gaji",
    amount: 15_000_000,
    date: "2026-02-01",
    note: "Gaji bulanan",
  },
  {
    id: "t2",
    type: "income",
    category: "Freelance",
    amount: 2_200_000,
    date: "2026-02-14",
    note: "Proyek desain",
  },
  { id: "t3", type: "expense", category: "Makan & Minum", amount: 3_200_000, date: "2026-02-05" },
  {
    id: "t4",
    type: "expense",
    category: "Tagihan",
    amount: 2_400_000,
    date: "2026-02-05",
    note: "Listrik, internet, air",
  },
  { id: "t5", type: "expense", category: "Belanja", amount: 1_800_000, date: "2026-02-12" },
  { id: "t6", type: "expense", category: "Hiburan", amount: 1_300_000, date: "2026-02-18" },
  { id: "t7", type: "expense", category: "Transport", amount: 1_100_000, date: "2026-02-20" },
  // Januari 2026
  { id: "t8", type: "income", category: "Gaji", amount: 15_000_000, date: "2026-01-01" },
  { id: "t9", type: "expense", category: "Makan & Minum", amount: 2_900_000, date: "2026-01-06" },
  { id: "t10", type: "expense", category: "Tagihan", amount: 2_300_000, date: "2026-01-05" },
  { id: "t11", type: "expense", category: "Belanja", amount: 2_400_000, date: "2026-01-15" },
  { id: "t12", type: "expense", category: "Transport", amount: 1_300_000, date: "2026-01-22" },
  // Desember 2025
  { id: "t13", type: "income", category: "Gaji", amount: 15_000_000, date: "2025-12-01" },
  {
    id: "t14",
    type: "income",
    category: "Bonus",
    amount: 3_000_000,
    date: "2025-12-20",
    note: "THR akhir tahun",
  },
  {
    id: "t15",
    type: "expense",
    category: "Belanja",
    amount: 4_200_000,
    date: "2025-12-24",
    note: "Liburan & hadiah",
  },
  { id: "t16", type: "expense", category: "Makan & Minum", amount: 3_600_000, date: "2025-12-15" },
  { id: "t17", type: "expense", category: "Tagihan", amount: 2_400_000, date: "2025-12-05" },
  { id: "t18", type: "expense", category: "Hiburan", amount: 2_400_000, date: "2025-12-28" },
];
