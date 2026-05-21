/** Format rupiah singkat: 133_000_000 -> "Rp133,0jt" */
export function rpShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return "Rp" + (n / 1e9).toFixed(1).replace(".", ",") + "M";
  if (abs >= 1e6) return "Rp" + (n / 1e6).toFixed(1).replace(".", ",") + "jt";
  if (abs >= 1e3) return "Rp" + Math.round(n / 1e3) + "rb";
  return "Rp" + n;
}

/** Format rupiah penuh: 133_000_000 -> "Rp133.000.000" */
export function rpFull(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
