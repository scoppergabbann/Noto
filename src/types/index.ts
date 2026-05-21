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
