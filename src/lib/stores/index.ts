import { createSupabaseStore } from "./createSupabaseStore";
import {
  goalsRepo,
  receivablesRepo,
  debtsRepo,
  cardsRepo,
  cardTxRepo,
  goldRepo,
  stocksRepo,
  assetsRepo,
  transactionsRepo,
  retirementPlansRepo,
  retirementFundsRepo,
  assetTransfersRepo,
} from "@/lib/db";
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

export const useGoalsStore = createSupabaseStore<Goal>(goalsRepo, "goals");

export const useReceivablesStore = createSupabaseStore<Receivable>(
  receivablesRepo,
  "receivables"
);

export const useDebtsStore = createSupabaseStore<Debt>(debtsRepo, "debts");

export const useCardsStore = createSupabaseStore<CreditCard>(
  cardsRepo,
  "cards"
);

export const useCardTxStore = createSupabaseStore<CardTransaction>(
  cardTxRepo,
  "card-tx"
);

export const useGoldStore = createSupabaseStore<GoldAsset>(
  goldRepo,
  "gold"
);

export const useStocksStore = createSupabaseStore<StockHolding>(
  stocksRepo,
  "stocks"
);

export const useAssetsStore = createSupabaseStore<OtherAsset>(
  assetsRepo,
  "assets"
);

export const useTransactionsStore = createSupabaseStore<Transaction>(
  transactionsRepo,
  "transactions"
);

export const useRetirementPlansStore = createSupabaseStore<RetirementPlan>(
  retirementPlansRepo,
  "retirement-plans"
);

export const useRetirementFundsStore = createSupabaseStore<RetirementFund>(
  retirementFundsRepo,
  "retirement-funds"
);

export const useAssetTransfersStore = createSupabaseStore<AssetTransfer>(
  assetTransfersRepo,
  "asset-transfers"
);