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
 * Me-rehydrate semua store dari localStorage sekali saat mount.
 * Dengan skipHydration:true di store, ini mencegah hydration mismatch:
 * render pertama pakai seed (sama dengan server), lalu data lokal masuk.
 */
export function StoreHydration() {
  useEffect(() => {
    useGoalsStore.persist.rehydrate();
    useReceivablesStore.persist.rehydrate();
    useDebtsStore.persist.rehydrate();
    useCardsStore.persist.rehydrate();
    useGoldStore.persist.rehydrate();
    useAssetsStore.persist.rehydrate();
    useTransactionsStore.persist.rehydrate();
  }, []);
  return null;
}
