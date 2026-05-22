"use client";

import { useEffect, useState } from "react";

/**
 * Mengembalikan true setelah komponen ter-mount di client.
 * Dipakai agar data dari localStorage (persist) tidak menyebabkan
 * hydration mismatch — render seed/skeleton dulu, lalu data asli.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
