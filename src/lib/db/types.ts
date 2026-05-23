export interface GoalRow {
  id: string;
  user_id: string;
  item: string;
  instrument: string | null;
  target_amount: number;
  used_amount: number;
  deadline: string | null;
  duration_months: number | null;
  color: string;
  emoji: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface ReceivableRow {
  id: string;
  user_id: string;
  item: string;
  debtor: string | null;
  total: number;
  paid: number;
  due_date: string | null;
  interest_type: "none" | "flat" | "floating";
  interest_rate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface DebtRow {
  id: string;
  user_id: string;
  item: string;
  creditor: string | null;
  total: number;
  paid: number;
  due_date: string | null;
  interest_type: "none" | "flat" | "floating";
  interest_rate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface CreditCardRow {
  id: string;
  user_id: string;
  name: string;
  credit_limit: number;
  spent: number;
  paid: number;
  gradient: string | null;
  last4: string | null;
  created_at: string;
  updated_at: string;
}
export interface CardTransactionRow {
  id: string;
  user_id: string;
  card_id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}
export interface GoldAssetRow {
  id: string;
  user_id: string;
  item: string;
  category: "savings" | "investment";
  bought_grams: number;
  sold_grams: number;
  buy_value: number;
  used_value: number;
  current_price_per_gram: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface StockHoldingRow {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  exchange: string;
  lots: number;
  avg_price: number;
  current_price: number;
  dividend_received: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface OtherAssetRow {
  id: string;
  user_id: string;
  item: string;
  emoji: string;
  unit: string | null;
  quantity: number;
  current_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface TransactionRow {
  id: string;
  user_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}
