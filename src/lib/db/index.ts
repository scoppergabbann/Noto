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
  toGoldAsset,
  fromGoldAsset,
  toOtherAsset,
  fromOtherAsset,
  toTransaction,
  fromTransaction,
} from "./mappers";
import type {
  GoalRow,
  ReceivableRow,
  DebtRow,
  CreditCardRow,
  GoldAssetRow,
  OtherAssetRow,
  TransactionRow,
} from "./types";
import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  GoldAsset,
  OtherAsset,
  Transaction,
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
export const goldRepo = makeRepo<GoldAssetRow, GoldAsset>(
  "gold_assets",
  toGoldAsset,
  fromGoldAsset
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
