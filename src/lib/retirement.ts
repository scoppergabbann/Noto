// ---- Retirement calculation engine ----

/**
 * Dana pensiun yang dibutuhkan saat pensiun (future value of monthly needs).
 * Menggunakan Present Value of Annuity dengan inflasi.
 *
 * @param monthlyNeedToday  kebutuhan bulanan saat ini (Rp)
 * @param yearsToRetirement berapa tahun lagi pensiun
 * @param inflationRate     % per tahun, mis. 5
 * @param lifeExpectancy    estimasi umur hidup setelah pensiun (default 25 tahun)
 * @param expectedReturn    % per tahun dari investasi saat pensiun, mis. 6
 */
export function targetFund(
  monthlyNeedToday: number,
  yearsToRetirement: number,
  inflationRate: number,
  lifeExpectancy: number = 25,
  expectedReturn: number = 6
): number {
  const ri = inflationRate / 100;
  const rr = expectedReturn / 100;

  // Kebutuhan bulanan saat pensiun (adjusted for inflation)
  const monthlyAtRetirement = monthlyNeedToday * Math.pow(1 + ri, yearsToRetirement);

  // Present Value of Annuity (dana yang dibutuhkan untuk bayar selama lifeExpectancy tahun)
  const monthlyReturn = rr / 12;
  const n = lifeExpectancy * 12;
  if (monthlyReturn === 0) return monthlyAtRetirement * n;
  const pv = monthlyAtRetirement * ((1 - Math.pow(1 + monthlyReturn, -n)) / monthlyReturn);
  return pv;
}

/**
 * Proyeksi nilai dana yang sudah ada + kontribusi bulanan saat pensiun.
 * Compound interest formula.
 */
export function projectedFund(
  currentSavings: number,
  monthlyContribution: number,
  yearsToRetirement: number,
  annualReturn: number
): number {
  const r = annualReturn / 100 / 12;
  const n = yearsToRetirement * 12;
  if (r === 0) return currentSavings + monthlyContribution * n;
  // FV of lump sum + FV of annuity
  const fvLump = currentSavings * Math.pow(1 + r, n);
  const fvAnnuity = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
  return fvLump + fvAnnuity;
}

/**
 * Gap: berapa yang masih kurang (atau surplus).
 */
export function fundGap(target: number, projected: number): number {
  return projected - target;
}

/**
 * Berapa yang perlu ditabung per bulan agar mencapai target.
 */
export function requiredMonthlySaving(
  target: number,
  currentSavings: number,
  yearsToRetirement: number,
  annualReturn: number
): number {
  const r = annualReturn / 100 / 12;
  const n = yearsToRetirement * 12;
  const fvLump = currentSavings * Math.pow(1 + r, n);
  const remaining = target - fvLump;
  if (remaining <= 0) return 0;
  if (r === 0) return remaining / n;
  return remaining / ((Math.pow(1 + r, n) - 1) / r);
}

/**
 * Progress % menuju target.
 */
export function retirementProgress(projected: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((projected / target) * 100));
}

/**
 * Persentase on-track berdasarkan usia dan proyeksi.
 * Returns 0..100 — skor kesehatan rencana pensiun.
 */
export function retirementHealthScore(projected: number, target: number): number {
  const ratio = target > 0 ? projected / target : 0;
  return Math.min(100, Math.round(ratio * 100));
}
