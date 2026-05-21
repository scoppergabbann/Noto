import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client. Aman dipakai di Client Components.
 * Hanya aktif jika env terisi; selama MVP boleh kosong (pakai mock data).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env belum diisi. Set NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local"
    );
  }
  return createBrowserClient(url, key);
}

/** Apakah app dikonfigurasi untuk pakai Supabase (vs mock data). */
export const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";
