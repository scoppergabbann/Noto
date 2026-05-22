// ---- Domain types (shared across app & future Supabase rows) ----

export interface Goal {
  id: string;
  item: string;
  instrument: string;
  targetAmount: number;
  usedAmount: number;
  deadline: string;
  durationMonths: number;
  color: string;
  emoji: string;
  notes?: string;
}

export interface Receivable {
  id: string;
  item: string;
  total: number;
  paid: number;
}

export interface Debt {
  id: string;
  item: string;
  total: number;
  paid: number;
  dueDate: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  spent: number;
  paid: number;
  gradient: string;
  last4: string;
}

export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export interface SummaryRow {
  label: string;
  value: string;
  tone: "" | "green" | "red";
}

export interface NetWorthPoint {
  month: string;
  asset: number;
  liability: number;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  spend: number;
}

export interface GoldAsset {
  id: string;
  item: string;
  category: "savings" | "investment";
  boughtGrams: number;
  soldGrams: number;
  buyValue: number; // total nilai saat dibeli (Rp)
  usedValue: number; // nilai terpakai/terjual (Rp)
  currentPricePerGram: number; // estimasi harga kini per gram (Rp)
  notes?: string;
}

export interface OtherAsset {
  id: string;
  item: string;
  unit: string;
  quantity: number;
  currentValue: number;
  emoji: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string; // ISO "YYYY-MM-DD"
  note?: string;
}
