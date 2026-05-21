// ---- Financial calculation engine (pure, testable functions) ----

/** Persentase progress, dibatasi 0..100+ (boleh > 100 untuk over-target). */
export function progressPct(used: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((used / target) * 100);
}

/** Sisa yang masih harus dikumpulkan. */
export function remaining(target: number, used: number): number {
  return Math.max(0, target - used);
}

/** Target tabungan per bulan agar goal tercapai tepat waktu. */
export function monthlyTarget(target: number, used: number, months: number): number {
  if (months <= 0) return remaining(target, used);
  return remaining(target, used) / months;
}

/** Rasio pemakaian kartu kredit (0..100). */
export function utilization(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/** Apakah pemakaian kartu masuk zona warning (>= 70%). */
export function isHighUtilization(spent: number, limit: number): boolean {
  return utilization(spent, limit) >= 70;
}

/** Net worth = total aset - total kewajiban. */
export function netWorth(assets: number, liabilities: number): number {
  return assets - liabilities;
}

/**
 * Skor kesehatan finansial sederhana (0..100).
 * Semakin rendah rasio utang terhadap aset, semakin tinggi skor.
 */
export function healthScore(assets: number, liabilities: number): number {
  if (assets <= 0) return 0;
  const debtRatio = liabilities / assets; // 0 = bagus, 1 = buruk
  const score = Math.round((1 - Math.min(debtRatio, 1)) * 100);
  return Math.max(0, Math.min(100, score));
}
