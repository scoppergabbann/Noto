import { createSupabaseStore } from "./createSupabaseStore";
import {
  goalsRepo,
  receivablesRepo,
  debtsRepo,
  cardsRepo,
  goldRepo,
  assetsRepo,
  transactionsRepo,
} from "@/lib/db";
import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  GoldAsset,
  OtherAsset,
  Transaction,
} from "@/types";

export const useGoalsStore = createSupabaseStore<Goal>(goalsRepo, "goals");
export const useReceivablesStore = createSupabaseStore<Receivable>(receivablesRepo, "receivables");
export const useDebtsStore = createSupabaseStore<Debt>(debtsRepo, "debts");
export const useCardsStore = createSupabaseStore<CreditCard>(cardsRepo, "cards");
export const useGoldStore = createSupabaseStore<GoldAsset>(goldRepo, "gold");
export const useAssetsStore = createSupabaseStore<OtherAsset>(assetsRepo, "assets");
export const useTransactionsStore = createSupabaseStore<Transaction>(
  transactionsRepo,
  "transactions"
);
