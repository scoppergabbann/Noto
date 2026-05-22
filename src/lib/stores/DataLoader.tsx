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
import { createClient } from "@/lib/supabase/client";

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

    async function loadAll() {
      // Fix #4 — JWT issued at future: refresh session dulu sebelum fetch data
      // Ini terjadi saat clock device tidak sinkron dengan server Supabase
      const sb = createClient();
      const { error: sessionErr } = await sb.auth.getSession();
      if (sessionErr) {
        await sb.auth.refreshSession();
      }
      await Promise.all([
        fetchGoals(),
        fetchReceivables(),
        fetchDebts(),
        fetchCards(),
        fetchGold(),
        fetchAssets(),
        fetchTransactions(),
      ]);
    }

    loadAll();
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
