// ---- Financial calculation engine (pure, testable functions) ----

export function progressPct(used: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((used / target) * 100);
}
export function remaining(target: number, used: number): number {
  return Math.max(0, target - used);
}
export function monthlyTarget(target: number, used: number, months: number): number {
  if (months <= 0) return remaining(target, used);
  return remaining(target, used) / months;
}
export function utilization(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}
export function isHighUtilization(spent: number, limit: number): boolean {
  return utilization(spent, limit) >= 70;
}
export function netWorth(assets: number, liabilities: number): number {
  return assets - liabilities;
}
export function healthScore(assets: number, liabilities: number): number {
  if (assets <= 0) return 0;
  const debtRatio = liabilities / assets;
  return Math.max(0, Math.min(100, Math.round((1 - Math.min(debtRatio, 1)) * 100)));
}

// ---- Gold ----
export function remainingGrams(bought: number, sold: number): number {
  return Math.max(0, bought - sold);
}
export function currentGoldValue(bought: number, sold: number, pricePerGram: number): number {
  return remainingGrams(bought, sold) * pricePerGram;
}
export function avgBuyPricePerGram(buyValue: number, boughtGrams: number): number {
  if (boughtGrams <= 0) return 0;
  return buyValue / boughtGrams;
}
export function goldProfitLoss(
  buyValue: number,
  usedValue: number,
  bought: number,
  sold: number,
  pricePerGram: number
): number {
  return currentGoldValue(bought, sold, pricePerGram) - (buyValue - usedValue);
}
export function goldProfitPct(
  buyValue: number,
  usedValue: number,
  bought: number,
  sold: number,
  pricePerGram: number
): number {
  const cost = buyValue - usedValue;
  if (cost <= 0) return 0;
  return Math.round((goldProfitLoss(buyValue, usedValue, bought, sold, pricePerGram) / cost) * 100);
}

// ---- Bunga (Receivable & Debt) ----
export function interestAccrued(
  principal: number,
  paid: number,
  rateMonthly: number,
  months: number,
  type: "none" | "flat" | "floating"
): number {
  if (type === "none" || rateMonthly <= 0 || months <= 0) return 0;
  const rate = rateMonthly / 100;
  if (type === "flat") return principal * rate * months;
  return Math.max(0, principal - paid) * rate * months;
}
export function totalOwed(
  principal: number,
  paid: number,
  rateMonthly: number,
  months: number,
  type: "none" | "flat" | "floating"
): number {
  return (
    Math.max(0, principal - paid) + interestAccrued(principal, paid, rateMonthly, months, type)
  );
}
export function monthlyInstallment(principal: number, rateMonthly: number, months: number): number {
  if (months <= 0) return principal;
  const totalInterest = principal * (rateMonthly / 100) * months;
  return (principal + totalInterest) / months;
}

// ---- Saham ----
export function stockMarketValue(lots: number, currentPrice: number): number {
  return lots * 100 * currentPrice;
}
export function stockCostBasis(lots: number, avgPrice: number): number {
  return lots * 100 * avgPrice;
}
export function stockUnrealizedPL(lots: number, avgPrice: number, currentPrice: number): number {
  return stockMarketValue(lots, currentPrice) - stockCostBasis(lots, avgPrice);
}
export function stockUnrealizedPct(avgPrice: number, currentPrice: number): number {
  if (avgPrice <= 0) return 0;
  return Math.round(((currentPrice - avgPrice) / avgPrice) * 100 * 10) / 10;
}
export function stockTotalReturn(
  lots: number,
  avgPrice: number,
  currentPrice: number,
  dividendReceived: number
): number {
  return stockUnrealizedPL(lots, avgPrice, currentPrice) + dividendReceived;
}

/** Weighted average return portofolio saham (berdasarkan modal). */
export function portfolioWeightedReturn(
  holdings: { lots: number; avgPrice: number; currentPrice: number }[]
): number {
  const totalCost = holdings.reduce((s, h) => s + stockCostBasis(h.lots, h.avgPrice), 0);
  if (totalCost <= 0) return 0;
  const weightedPL = holdings.reduce(
    (s, h) => s + stockUnrealizedPL(h.lots, h.avgPrice, h.currentPrice),
    0
  );
  return Math.round((weightedPL / totalCost) * 100 * 10) / 10;
}

/** Bobot portofolio saham (% dari total market value). */
export function stockPortfolioWeight(
  lots: number,
  currentPrice: number,
  totalMarketValue: number
): number {
  if (totalMarketValue <= 0) return 0;
  return Math.round((stockMarketValue(lots, currentPrice) / totalMarketValue) * 100 * 10) / 10;
}
