import { createCrudStore } from "./createCrudStore";
import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  GoldAsset,
  OtherAsset,
  Transaction,
} from "@/types";
import {
  goals as seedGoals,
  receivables as seedReceivables,
  debts as seedDebts,
  creditCards as seedCards,
  goldAssets as seedGold,
  otherAssets as seedAssets,
  transactions as seedTransactions,
} from "@/data/mock";

export const useGoalsStore = createCrudStore<Goal>("goals", seedGoals, "g");
export const useReceivablesStore = createCrudStore<Receivable>("receivables", seedReceivables, "r");
export const useDebtsStore = createCrudStore<Debt>("debts", seedDebts, "d");
export const useCardsStore = createCrudStore<CreditCard>("cards", seedCards, "c");
export const useGoldStore = createCrudStore<GoldAsset>("gold", seedGold, "au");
export const useAssetsStore = createCrudStore<OtherAsset>("assets", seedAssets, "o");
export const useTransactionsStore = createCrudStore<Transaction>(
  "transactions",
  seedTransactions,
  "t"
);
