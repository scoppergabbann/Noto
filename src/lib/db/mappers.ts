import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  GoldAsset,
  OtherAsset,
  Transaction,
} from "@/types";
import type {
  GoalRow,
  ReceivableRow,
  DebtRow,
  CreditCardRow,
  GoldAssetRow,
  OtherAssetRow,
  TransactionRow,
} from "./types";

// ---- Goals ----
export const toGoal = (r: GoalRow): Goal => ({
  id: r.id,
  item: r.item,
  instrument: r.instrument ?? "",
  targetAmount: Number(r.target_amount),
  usedAmount: Number(r.used_amount),
  deadline: r.deadline ?? "",
  durationMonths: r.duration_months ?? 0,
  color: r.color,
  emoji: r.emoji,
  notes: r.notes ?? "",
});
export const fromGoal = (g: Omit<Goal, "id">, userId: string) => ({
  user_id: userId,
  item: g.item,
  instrument: g.instrument || null,
  target_amount: g.targetAmount,
  used_amount: g.usedAmount,
  deadline: g.deadline || null,
  duration_months: g.durationMonths || null,
  color: g.color,
  emoji: g.emoji,
  notes: g.notes || null,
  updated_at: new Date().toISOString(),
});

// ---- Receivables ----
export const toReceivable = (r: ReceivableRow): Receivable => ({
  id: r.id,
  item: r.item,
  debtor: r.debtor ?? "",
  total: Number(r.total),
  paid: Number(r.paid),
  dueDate: r.due_date ?? "",
  notes: r.notes ?? "",
});
export const fromReceivable = (d: Omit<Receivable, "id">, userId: string) => ({
  user_id: userId,
  item: d.item,
  debtor: d.debtor || null,
  total: d.total,
  paid: d.paid,
  due_date: d.dueDate || null,
  notes: d.notes || null,
  updated_at: new Date().toISOString(),
});

// ---- Debts ----
export const toDebt = (r: DebtRow): Debt => ({
  id: r.id,
  item: r.item,
  creditor: r.creditor ?? "",
  total: Number(r.total),
  paid: Number(r.paid),
  dueDate: r.due_date ?? "",
  notes: r.notes ?? "",
});
export const fromDebt = (d: Omit<Debt, "id">, userId: string) => ({
  user_id: userId,
  item: d.item,
  creditor: d.creditor || null,
  total: d.total,
  paid: d.paid,
  due_date: d.dueDate || null,
  notes: d.notes || null,
  updated_at: new Date().toISOString(),
});

// ---- Credit Cards ----
export const toCreditCard = (r: CreditCardRow): CreditCard => ({
  id: r.id,
  name: r.name,
  creditLimit: Number(r.credit_limit),
  spent: Number(r.spent),
  paid: Number(r.paid),
  gradient: r.gradient ?? "from-slate-700 to-slate-900",
  last4: r.last4 ?? "",
});
export const fromCreditCard = (c: Omit<CreditCard, "id">, userId: string) => ({
  user_id: userId,
  name: c.name,
  credit_limit: c.creditLimit,
  spent: c.spent,
  paid: c.paid,
  gradient: c.gradient || null,
  last4: c.last4 || null,
  updated_at: new Date().toISOString(),
});

// ---- Gold ----
export const toGoldAsset = (r: GoldAssetRow): GoldAsset => ({
  id: r.id,
  item: r.item,
  category: r.category,
  boughtGrams: Number(r.bought_grams),
  soldGrams: Number(r.sold_grams),
  buyValue: Number(r.buy_value),
  usedValue: Number(r.used_value),
  currentPricePerGram: Number(r.current_price_per_gram),
  notes: r.notes ?? "",
});
export const fromGoldAsset = (g: Omit<GoldAsset, "id">, userId: string) => ({
  user_id: userId,
  item: g.item,
  category: g.category,
  bought_grams: g.boughtGrams,
  sold_grams: g.soldGrams,
  buy_value: g.buyValue,
  used_value: g.usedValue,
  current_price_per_gram: g.currentPricePerGram,
  notes: g.notes || null,
  updated_at: new Date().toISOString(),
});

// ---- Other Assets ----
export const toOtherAsset = (r: OtherAssetRow): OtherAsset => ({
  id: r.id,
  item: r.item,
  emoji: r.emoji,
  unit: r.unit ?? "unit",
  quantity: Number(r.quantity),
  currentValue: Number(r.current_value),
  notes: r.notes ?? "",
});
export const fromOtherAsset = (a: Omit<OtherAsset, "id">, userId: string) => ({
  user_id: userId,
  item: a.item,
  emoji: a.emoji,
  unit: a.unit || null,
  quantity: a.quantity,
  current_value: a.currentValue,
  notes: a.notes || null,
  updated_at: new Date().toISOString(),
});

// ---- Transactions ----
export const toTransaction = (r: TransactionRow): Transaction => ({
  id: r.id,
  type: r.type,
  category: r.category,
  amount: Number(r.amount),
  date: r.date,
  note: r.note ?? "",
});
export const fromTransaction = (t: Omit<Transaction, "id">, userId: string) => ({
  user_id: userId,
  type: t.type,
  category: t.category,
  amount: t.amount,
  date: t.date,
  note: t.note || null,
  updated_at: new Date().toISOString(),
});
