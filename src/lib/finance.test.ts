import { describe, it, expect } from "vitest";
import {
  progressPct,
  remaining,
  monthlyTarget,
  utilization,
  isHighUtilization,
  netWorth,
  healthScore,
  remainingGrams,
  currentGoldValue,
  avgBuyPricePerGram,
  goldProfitLoss,
  goldProfitPct,
} from "./finance";

describe("progressPct", () => {
  it("hitung persentase normal", () => {
    expect(progressPct(50, 100)).toBe(50);
    expect(progressPct(18.5e6, 30e6)).toBe(62);
  });
  it("target 0 → 0 (hindari bagi nol)", () => {
    expect(progressPct(100, 0)).toBe(0);
  });
  it("boleh melebihi 100 untuk over-target", () => {
    expect(progressPct(120, 100)).toBe(120);
  });
  it("nilai 0 → 0%", () => {
    expect(progressPct(0, 100)).toBe(0);
  });
});

describe("remaining", () => {
  it("sisa normal", () => {
    expect(remaining(100, 30)).toBe(70);
  });
  it("tidak pernah negatif (sudah over-target)", () => {
    expect(remaining(100, 130)).toBe(0);
  });
  it("tepat tercapai → 0", () => {
    expect(remaining(100, 100)).toBe(0);
  });
});

describe("monthlyTarget", () => {
  it("bagi sisa rata per bulan", () => {
    expect(monthlyTarget(100, 40, 6)).toBe(10); // sisa 60 / 6
  });
  it("durasi 0 → kembalikan seluruh sisa", () => {
    expect(monthlyTarget(100, 40, 0)).toBe(60);
  });
  it("durasi negatif → seluruh sisa (guard)", () => {
    expect(monthlyTarget(100, 40, -3)).toBe(60);
  });
  it("sudah tercapai → 0 per bulan", () => {
    expect(monthlyTarget(100, 100, 6)).toBe(0);
  });
});

describe("utilization", () => {
  it("rasio pemakaian kartu", () => {
    expect(utilization(19.4e6, 25e6)).toBe(78);
    expect(utilization(5e6, 10e6)).toBe(50);
  });
  it("limit 0 → 0 (hindari bagi nol)", () => {
    expect(utilization(5e6, 0)).toBe(0);
  });
});

describe("isHighUtilization", () => {
  it("≥70% dianggap tinggi", () => {
    expect(isHighUtilization(70, 100)).toBe(true);
    expect(isHighUtilization(78, 100)).toBe(true);
  });
  it("<70% aman", () => {
    expect(isHighUtilization(69, 100)).toBe(false);
    expect(isHighUtilization(30, 100)).toBe(false);
  });
});

describe("netWorth", () => {
  it("aset minus kewajiban", () => {
    expect(netWorth(133e6, 25e6)).toBe(108e6);
  });
  it("bisa negatif (utang > aset)", () => {
    expect(netWorth(10e6, 25e6)).toBe(-15e6);
  });
});

describe("healthScore", () => {
  it("tanpa utang → 100", () => {
    expect(healthScore(100e6, 0)).toBe(100);
  });
  it("rasio utang rendah → skor tinggi", () => {
    // utang 18.8% dari aset → skor ~81
    expect(healthScore(133e6, 25e6)).toBe(81);
  });
  it("utang = aset → 0", () => {
    expect(healthScore(100e6, 100e6)).toBe(0);
  });
  it("utang melebihi aset → tetap 0 (clamp)", () => {
    expect(healthScore(50e6, 100e6)).toBe(0);
  });
  it("aset 0 → 0", () => {
    expect(healthScore(0, 10e6)).toBe(0);
  });
  it("hasil selalu di rentang 0..100", () => {
    const s = healthScore(200e6, 30e6);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe("emas: remainingGrams & currentGoldValue", () => {
  it("sisa gram beli - jual", () => {
    expect(remainingGrams(15, 2)).toBe(13);
  });
  it("jual lebih dari beli → 0 (guard)", () => {
    expect(remainingGrams(5, 8)).toBe(0);
  });
  it("nilai emas tersisa = sisa gram × harga/gram", () => {
    expect(currentGoldValue(15, 2, 1_350_000)).toBe(13 * 1_350_000);
  });
});

describe("avgBuyPricePerGram", () => {
  it("harga rata-rata per gram", () => {
    expect(avgBuyPricePerGram(16_500_000, 15)).toBe(1_100_000);
  });
  it("gram 0 → 0 (hindari bagi nol)", () => {
    expect(avgBuyPricePerGram(16_500_000, 0)).toBe(0);
  });
});

describe("goldProfitLoss & goldProfitPct", () => {
  it("untung saat nilai kini > modal tersisa", () => {
    // beli 15gr @1.1jt = 16.5jt; jual 2gr senilai 2.4jt; sisa 13gr @1.35jt = 17.55jt
    // modal tersisa = 16.5 - 2.4 = 14.1jt; PL = 17.55 - 14.1 = 3.45jt
    const pl = goldProfitLoss(16_500_000, 2_400_000, 15, 2, 1_350_000);
    expect(pl).toBe(3_450_000);
    expect(goldProfitPct(16_500_000, 2_400_000, 15, 2, 1_350_000)).toBe(24); // 3.45/14.1 ≈ 24%
  });
  it("rugi saat harga turun", () => {
    const pl = goldProfitLoss(16_500_000, 0, 15, 0, 1_000_000);
    // sisa 15gr @1jt = 15jt; modal 16.5jt; PL = -1.5jt
    expect(pl).toBe(-1_500_000);
    expect(goldProfitPct(16_500_000, 0, 15, 0, 1_000_000)).toBe(-9); // -1.5/16.5 ≈ -9%
  });
  it("modal tersisa 0 → profit pct 0 (guard)", () => {
    expect(goldProfitPct(10_000_000, 10_000_000, 10, 10, 1_350_000)).toBe(0);
  });
});
