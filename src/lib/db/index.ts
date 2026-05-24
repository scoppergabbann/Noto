import { makeRepo } from "./repository";
import {
  toGoal,
  fromGoal,
  toReceivable,
  fromReceivable,
  toDebt,
  fromDebt,
  toCreditCard,
  fromCreditCard,
  toCardTransaction,
  fromCardTransaction,
  toGoldAsset,
  fromGoldAsset,
  toStockHolding,
  fromStockHolding,
  toOtherAsset,
  fromOtherAsset,
  toTransaction,
  fromTransaction,
  toRetirementPlan,
  fromRetirementPlan,
  toRetirementFund,
  fromRetirementFund,
} from "./mappers";
import type {
  GoalRow,
  ReceivableRow,
  DebtRow,
  CreditCardRow,
  CardTransactionRow,
  GoldAssetRow,
  StockHoldingRow,
  OtherAssetRow,
  TransactionRow,
  RetirementPlanRow,
  RetirementFundRow,
} from "./types";
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
} from "@/types";

export const goalsRepo = makeRepo<GoalRow, Goal>("goals", toGoal, fromGoal);
export const receivablesRepo = makeRepo<ReceivableRow, Receivable>(
  "receivables",
  toReceivable,
  fromReceivable
);
export const debtsRepo = makeRepo<DebtRow, Debt>("debts", toDebt, fromDebt);
export const cardsRepo = makeRepo<CreditCardRow, CreditCard>(
  "credit_cards",
  toCreditCard,
  fromCreditCard
);
export const cardTxRepo = makeRepo<CardTransactionRow, CardTransaction>(
  "card_transactions",
  toCardTransaction,
  fromCardTransaction
);
export const goldRepo = makeRepo<GoldAssetRow, GoldAsset>(
  "gold_assets",
  toGoldAsset,
  fromGoldAsset
);
export const stocksRepo = makeRepo<StockHoldingRow, StockHolding>(
  "stock_holdings",
  toStockHolding,
  fromStockHolding
);
export const assetsRepo = makeRepo<OtherAssetRow, OtherAsset>(
  "other_assets",
  toOtherAsset,
  fromOtherAsset
);
export const transactionsRepo = makeRepo<TransactionRow, Transaction>(
  "transactions",
  toTransaction,
  fromTransaction
);
export const retirementPlansRepo = makeRepo<RetirementPlanRow, RetirementPlan>(
  "retirement_plans",
  toRetirementPlan,
  fromRetirementPlan
);
export const retirementFundsRepo = makeRepo<RetirementFundRow, RetirementFund>(
  "retirement_funds",
  toRetirementFund,
  fromRetirementFund
);
