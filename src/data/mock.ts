import type {
  Goal, CreditCard, SpendingCategory, SummaryRow,
  NetWorthPoint, CashFlowPoint,
} from "@/types";

export const goals: Goal[] = [
  { id: "g1", item: "Dana Darurat", instrument: "Bank Jago", targetAmount: 30_000_000, usedAmount: 18_500_000, deadline: "Des 2026", durationMonths: 10, color: "#1f9e6f", emoji: "🛡️" },
  { id: "g2", item: "Liburan Jepang", instrument: "Reksadana", targetAmount: 25_000_000, usedAmount: 9_000_000, deadline: "Okt 2026", durationMonths: 8, color: "#6b6ff0", emoji: "🗾" },
  { id: "g3", item: "DP Motor", instrument: "Deposito", targetAmount: 15_000_000, usedAmount: 13_200_000, deadline: "Jun 2026", durationMonths: 3, color: "#ff9d2e", emoji: "🛵" },
];

export const creditCards: CreditCard[] = [
  { id: "c1", name: "BCA Mastercard", limit: 25_000_000, spent: 19_400_000, paid: 6_000_000, gradient: "linear-gradient(135deg,#3a3f8f,#6b6ff0)", last4: "4821" },
  { id: "c2", name: "Jenius Visa", limit: 15_000_000, spent: 4_200_000, paid: 4_200_000, gradient: "linear-gradient(135deg,#0d6e4f,#1f9e6f)", last4: "9034" },
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
