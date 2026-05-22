# Migrasi ke Supabase — Step-by-Step Guide

Noto sekarang punya **2 storage layer**:
- **Zustand + localStorage** (default) — offline-first, nggak butuh backend
- **Supabase (opsional)** — sinkronisasi cloud, multi-device

Kalau mau upgrade ke Supabase, ikuti guide ini.

## Prasyarat
1. Setup Supabase project (lihat `SUPABASE_SETUP.md`)
2. `.env.local` sudah ada dengan credential Supabase

## Architecture

Saat ini:
- **`src/lib/supabase/client.ts`** — Supabase client
- **`src/lib/supabase/queries.ts`** — CRUD queries per table (7 set)
- **`src/lib/hooks/useSupabaseData.ts`** — React hook abstraksi (mirip Zustand API)

User pages pakai Zustand `useXxxStore()`. Satu page dikali convert pakai hook `useSupabaseData("table")`.

## Migration Example: Halaman `/cash` (Goals)

### Step 1: Replace import
Dari:
```tsx
import { useGoalsStore } from "@/lib/stores";
```

Ke:
```tsx
import { useSupabaseData } from "@/lib/hooks/useSupabaseData";
```

### Step 2: Replace hook call
Dari:
```tsx
const { items, add, update, remove } = useGoalsStore((s) => s.items);
```

Ke:
```tsx
const { items, loading, error, add, update, remove } = useSupabaseData<Goal>("goals");
```

### Step 3: Add loading/error UI
```tsx
if (loading) return <div>Memuat...</div>;
if (error) return <div>Error: {error}</div>;
```

### Step 4: Add auth page (jika belum ada)
- Buat `/auth` page (lihat contoh di `src/app/auth/page.tsx`)
- Redirect dari `/` ke `/auth` jika belum login

## Struktur File

```
src/lib/supabase/
├── client.ts           # Browser + server client
├── queries.ts          # 7 table CRUD ops
├── server.ts           # (server-side, optional)
└── (tidak ada mappers — langsung map di queries)

src/lib/hooks/
└── useSupabaseData.ts  # Generic hook (replace Zustand)

src/app/auth/
└── page.tsx            # Login/signup form
```

## Halaman-halaman yg perlu di-migrate (7):
1. `/cash` (goals) ✓ template siap
2. `/receivables` (piutang)
3. `/debts` (utang)
4. `/cards` (kartu kredit)
5. `/gold` (emas)
6. `/assets` (aset lain)
7. `/summary` (transaksi)

Setiap ikut pattern yg sama:
- `useSupabaseData<Type>("table")`
- Tambah loading/error handling
- Submit form pakai `add()` / `update()` / `remove()`

## Testing Lokal

Supaya dev nggak perlu Supabase, tetap pakai Zustand. Kalau mau test Supabase:

```bash
# Pastikan .env.local ada dengan credential
npm run dev

# Buka http://localhost:3000/auth
# Daftar akun baru atau login
# Halaman dashboard akan load dari Supabase
```

## Catatan Penting

- **Offline tidak berfungsi** dengan Supabase (loading dari server)
- Kalau ingin offline + sync, perlu tambahan logic (conflict resolution, queue pending actions)
- Untuk sekarang, gunakan **salah satu**: localStorage (offline) ATAU Supabase (sync)
- Di halaman yg sudah di-migrate ke Supabase, jangan import Zustand store — bisa bentrok

## Status
- ✅ Supabase client setup
- ✅ Query layer (semua 7 table)
- ✅ useSupabaseData hook
- ✅ Auth page template
- ⏳ Migrate 7 halaman (manual, ikuti pattern)
