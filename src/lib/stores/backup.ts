import {
  useGoalsStore,
  useReceivablesStore,
  useDebtsStore,
  useCardsStore,
  useGoldStore,
  useAssetsStore,
  useTransactionsStore,
} from "./index";

const STORES = {
  goals: useGoalsStore,
  receivables: useReceivablesStore,
  debts: useDebtsStore,
  cards: useCardsStore,
  gold: useGoldStore,
  assets: useAssetsStore,
  transactions: useTransactionsStore,
} as const;

/** Kumpulkan semua data jadi satu objek JSON. */
export function exportData(): string {
  const data: Record<string, unknown> = {
    _app: "noto",
    _version: 1,
    exportedAt: new Date().toISOString(),
  };
  (Object.keys(STORES) as (keyof typeof STORES)[]).forEach((k) => {
    data[k] = STORES[k].getState().items;
  });
  return JSON.stringify(data, null, 2);
}

/** Picu download file backup .json. */
export function downloadBackup() {
  const blob = new Blob([exportData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noto-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Impor dari teks JSON. Mengembalikan {ok, message}. */
export function importData(json: string): { ok: boolean; message: string } {
  try {
    const data = JSON.parse(json);
    if (data._app !== "noto") return { ok: false, message: "File ini bukan backup Noto." };
    (Object.keys(STORES) as (keyof typeof STORES)[]).forEach((k) => {
      if (Array.isArray(data[k])) {
        STORES[k].getState().replaceAll(data[k]);
      }
    });
    return { ok: true, message: "Data berhasil dipulihkan." };
  } catch {
    return { ok: false, message: "File tidak valid atau rusak." };
  }
}

/** Kembalikan semua data ke contoh awal (seed). */
export function resetAll() {
  (Object.keys(STORES) as (keyof typeof STORES)[]).forEach((k) => STORES[k].getState().reset());
}
