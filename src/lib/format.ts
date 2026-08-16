/** Format rupiah singkat: 133_000_000 -> "Rp133,0jt" */
export function isMoneyHidden(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem("noto-privacy");
    if (!raw) return true;

    const parsed = JSON.parse(raw) as {
      state?: { hideMoney?: boolean; visibleUntil?: number | null };
    };
    const state = parsed.state;
    const visibleUntil = Number(state?.visibleUntil ?? 0);

    if (state?.hideMoney === false && visibleUntil > Date.now()) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

export function maskMoney(value: string): string {
  if (!isMoneyHidden()) return value;

  const suffix = value.match(/(\/[a-zA-Z]+|\/bulan|\/bln|\/gr)$/)?.[0] ?? "";
  return `Rp****${suffix}`;
}

export function rpShort(n: number): string {
  if (isMoneyHidden()) return "Rp****";

  const abs = Math.abs(n);
  if (abs >= 1e9) return "Rp" + (n / 1e9).toFixed(1).replace(".", ",") + "M";
  if (abs >= 1e6) return "Rp" + (n / 1e6).toFixed(1).replace(".", ",") + "jt";
  if (abs >= 1e3) return "Rp" + Math.round(n / 1e3) + "rb";
  return "Rp" + n;
}

/** Format rupiah penuh: 133_000_000 -> "Rp133.000.000" */
export function rpFull(n: number): string {
  if (isMoneyHidden()) return "Rp****";

  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
