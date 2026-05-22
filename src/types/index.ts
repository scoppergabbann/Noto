// Domain types — camelCase, shared across UI + Supabase layer

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
  debtor: string;
  total: number;
  paid: number;
  dueDate: string;
  notes?: string;
}

export interface Debt {
  id: string;
  item: string;
  creditor: string;
  total: number;
  paid: number;
  dueDate: string;
  notes?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  spent: number;
  paid: number;
  gradient: string;
  last4: string;
}

export interface GoldAsset {
  id: string;
  item: string;
  category: "savings" | "investment";
  boughtGrams: number;
  soldGrams: number;
  buyValue: number;
  usedValue: number;
  currentPricePerGram: number;
  notes?: string;
}

export interface OtherAsset {
  id: string;
  item: string;
  emoji: string;
  unit: string;
  quantity: number;
  currentValue: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  note?: string;
}

// Legacy chart types (used by mock data)
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
