"use client";

import { useEffect } from "react";
import {
  useGoalsStore,
  useReceivablesStore,
  useDebtsStore,
  useCardsStore,
  useCardTxStore,
  useGoldStore,
  useStocksStore,
  useAssetsStore,
  useTransactionsStore,
  useRetirementPlansStore,
  useRetirementFundsStore,
} from "./index";
import { createClient } from "@/lib/supabase/client";

export function DataLoader({ userId }: { userId: string }) {
  const fetchGoals = useGoalsStore((s) => s.fetch);
  const fetchReceivables = useReceivablesStore((s) => s.fetch);
  const fetchDebts = useDebtsStore((s) => s.fetch);
  const fetchCards = useCardsStore((s) => s.fetch);
  const fetchCardTx = useCardTxStore((s) => s.fetch);
  const fetchGold = useGoldStore((s) => s.fetch);
  const fetchStocks = useStocksStore((s) => s.fetch);
  const fetchAssets = useAssetsStore((s) => s.fetch);
  const fetchTransactions = useTransactionsStore((s) => s.fetch);
  const fetchRetirementPlans = useRetirementPlansStore((s) => s.fetch);
  const fetchRetirementFunds = useRetirementFundsStore((s) => s.fetch);

  useEffect(() => {
    if (!userId) return;

    async function loadAll() {
      // Fix JWT issued at future
      const sb = createClient();
      const { error: sessionErr } = await sb.auth.getSession();
      if (sessionErr) await sb.auth.refreshSession();

      await Promise.all([
        fetchGoals(),
        fetchReceivables(),
        fetchDebts(),
        fetchCards(),
        fetchCardTx(),
        fetchGold(),
        fetchStocks(),
        fetchAssets(),
        fetchTransactions(),
        fetchRetirementPlans(),
        fetchRetirementFunds(),
      ]);
    }

    loadAll();
  }, [
    userId,
    fetchGoals,
    fetchReceivables,
    fetchDebts,
    fetchCards,
    fetchCardTx,
    fetchGold,
    fetchStocks,
    fetchAssets,
    fetchTransactions,
    fetchRetirementPlans,
    fetchRetirementFunds,
  ]);

  return null;
}
