import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  CardTransaction,
  GoldAsset,
  StockHolding,
  OtherAsset,
  Transaction,
  RetirementPlan,
  RetirementFund,
  AssetTransfer,
} from "@/types";
import type {
  GoalRow,
  ReceivableRow,
  DebtRow,
  CreditCardRow,
  CardTransactionRow,
  GoldAssetRow,
  StockHoldingRow,
  OtherAssetRow,
  RetirementPlanRow,
  RetirementFundRow,
  TransactionRow,
  AssetTransferRow,
} from "./types";

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

export const toReceivable = (r: ReceivableRow): Receivable => ({
  id: r.id,
  item: r.item,
  debtor: r.debtor ?? "",
  total: Number(r.total),
  paid: Number(r.paid),
  dueDate: r.due_date ?? "",
  interestType: r.interest_type ?? "none",
  interestRate: Number(r.interest_rate ?? 0),
  notes: r.notes ?? "",
});
export const fromReceivable = (d: Omit<Receivable, "id">, userId: string) => ({
  user_id: userId,
  item: d.item,
  debtor: d.debtor || null,
  total: d.total,
  paid: d.paid,
  due_date: d.dueDate || null,
  interest_type: d.interestType,
  interest_rate: d.interestRate,
  notes: d.notes || null,
  updated_at: new Date().toISOString(),
});

export const toDebt = (r: DebtRow): Debt => ({
  id: r.id,
  item: r.item,
  creditor: r.creditor ?? "",
  total: Number(r.total),
  paid: Number(r.paid),
  dueDate: r.due_date ?? "",
  interestType: r.interest_type ?? "none",
  interestRate: Number(r.interest_rate ?? 0),
  notes: r.notes ?? "",
});
export const fromDebt = (d: Omit<Debt, "id">, userId: string) => ({
  user_id: userId,
  item: d.item,
  creditor: d.creditor || null,
  total: d.total,
  paid: d.paid,
  due_date: d.dueDate || null,
  interest_type: d.interestType,
  interest_rate: d.interestRate,
  notes: d.notes || null,
  updated_at: new Date().toISOString(),
});

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

export const toCardTransaction = (r: CardTransactionRow): CardTransaction => ({
  id: r.id,
  cardId: r.card_id,
  merchant: r.merchant,
  category: r.category,
  amount: Number(r.amount),
  date: r.date,
  note: r.note ?? "",
});
export const fromCardTransaction = (t: Omit<CardTransaction, "id">, userId: string) => ({
  user_id: userId,
  card_id: t.cardId,
  merchant: t.merchant,
  category: t.category,
  amount: t.amount,
  date: t.date,
  note: t.note || null,
  updated_at: new Date().toISOString(),
});

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

export const toStockHolding = (r: StockHoldingRow): StockHolding => ({
  id: r.id,
  ticker: r.ticker,
  name: r.name,
  exchange: r.exchange,

  // New stock journal fields
  broker: r.broker ?? "",
  targetPrice: Number(r.target_price ?? 0),
  buyReason: r.buy_reason ?? "",
  exitPlan: r.exit_plan ?? "",
  conviction: Number(r.conviction ?? 3),

  lots: Number(r.lots),
  avgPrice: Number(r.avg_price),
  currentPrice: Number(r.current_price),
  dividendReceived: Number(r.dividend_received),
  notes: r.notes ?? "",
});

export const fromStockHolding = (s: Omit<StockHolding, "id">, userId: string) => ({
  user_id: userId,
  ticker: s.ticker.toUpperCase(),
  name: s.name,
  exchange: s.exchange,

  // New stock journal fields
  broker: s.broker || null,
  target_price: s.targetPrice || 0,
  buy_reason: s.buyReason || null,
  exit_plan: s.exitPlan || null,
  conviction: s.conviction || 3,

  lots: s.lots,
  avg_price: s.avgPrice,
  current_price: s.currentPrice,
  dividend_received: s.dividendReceived,
  notes: s.notes || null,
  updated_at: new Date().toISOString(),
});

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

// ---- Asset Transfers ----
export const toAssetTransfer = (r: AssetTransferRow): AssetTransfer => ({
  id: r.id,
  fromGoalId: r.from_goal_id,
  toGoalId: r.to_goal_id,
  amount: Number(r.amount),
  date: r.date,
  note: r.note ?? "",
  createdAt: r.created_at,
});

export const fromAssetTransfer = (t: Omit<AssetTransfer, "id" | "createdAt">, userId: string) => ({
  user_id: userId,
  from_goal_id: t.fromGoalId,
  to_goal_id: t.toGoalId,
  amount: t.amount,
  date: t.date,
  note: t.note || null,
});

// ---- Retirement ----
export const toRetirementPlan = (r: RetirementPlanRow): RetirementPlan => ({
  id: r.id,
  label: r.label,
  currentAge: r.current_age,
  retirementAge: r.retirement_age,
  monthlyNeedToday: Number(r.monthly_need_today),
  inflationRate: Number(r.inflation_rate),
  expectedReturn: Number(r.expected_return),
  lifeExpectancy: r.life_expectancy,
  notes: r.notes ?? "",
});

export const fromRetirementPlan = (p: Omit<RetirementPlan, "id">, userId: string) => ({
  user_id: userId,
  label: p.label,
  current_age: p.currentAge,
  retirement_age: p.retirementAge,
  monthly_need_today: p.monthlyNeedToday,
  inflation_rate: p.inflationRate,
  expected_return: p.expectedReturn,
  life_expectancy: p.lifeExpectancy,
  notes: p.notes || null,
  updated_at: new Date().toISOString(),
});

export const toRetirementFund = (r: RetirementFundRow): RetirementFund => ({
  id: r.id,
  planId: r.plan_id,
  name: r.name,
  type: r.type as RetirementFund["type"],
  currentValue: Number(r.current_value),
  monthlyContribution: Number(r.monthly_contribution),
  notes: r.notes ?? "",
});

export const fromRetirementFund = (f: Omit<RetirementFund, "id">, userId: string) => ({
  user_id: userId,
  plan_id: f.planId,
  name: f.name,
  type: f.type,
  current_value: f.currentValue,
  monthly_contribution: f.monthlyContribution,
  notes: f.notes || null,
  updated_at: new Date().toISOString(),
});
