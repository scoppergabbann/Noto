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
  interestType: "none" | "flat" | "floating";
  interestRate: number;
  notes?: string;
}

export interface Debt {
  id: string;
  item: string;
  creditor: string;
  total: number;
  paid: number;
  dueDate: string;
  interestType: "none" | "flat" | "floating";
  interestRate: number;
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

export interface CardTransaction {
  id: string;
  cardId: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
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

export interface StockHolding {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  lots: number;
  avgPrice: number;
  currentPrice: number;
  dividendReceived: number;
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
  date: string;
  note?: string;
}

// Legacy chart types
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

// Pensiun
export interface RetirementPlan {
  id: string;
  label: string;
  currentAge: number;
  retirementAge: number;
  monthlyNeedToday: number;
  inflationRate: number;
  expectedReturn: number;
  lifeExpectancy: number;
  notes?: string;
}

export interface RetirementFund {
  id: string;
  planId: string;
  name: string; // mis. "DPLK BCA", "Tabungan Khusus"
  type: "dplk" | "bpjs" | "savings" | "investment" | "property" | "other";
  currentValue: number;
  monthlyContribution: number;
  notes?: string;
}
