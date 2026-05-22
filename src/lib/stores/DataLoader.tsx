"use client";

import { useEffect } from "react";
import {
  useGoalsStore,
  useReceivablesStore,
  useDebtsStore,
  useCardsStore,
  useGoldStore,
  useAssetsStore,
  useTransactionsStore,
} from "./index";

/**
 * Dipasang di dashboard layout. Fetch semua data dari Supabase
 * sekali ketika user sudah login (user prop datang dari server).
 */
export function DataLoader({ userId }: { userId: string }) {
  const fetchGoals = useGoalsStore((s) => s.fetch);
  const fetchReceivables = useReceivablesStore((s) => s.fetch);
  const fetchDebts = useDebtsStore((s) => s.fetch);
  const fetchCards = useCardsStore((s) => s.fetch);
  const fetchGold = useGoldStore((s) => s.fetch);
  const fetchAssets = useAssetsStore((s) => s.fetch);
  const fetchTransactions = useTransactionsStore((s) => s.fetch);

  useEffect(() => {
    if (!userId) return;
    // Fetch semua domain paralel
    Promise.all([
      fetchGoals(),
      fetchReceivables(),
      fetchDebts(),
      fetchCards(),
      fetchGold(),
      fetchAssets(),
      fetchTransactions(),
    ]);
  }, [
    userId,
    fetchGoals,
    fetchReceivables,
    fetchDebts,
    fetchCards,
    fetchGold,
    fetchAssets,
    fetchTransactions,
  ]);

  return null;
}
