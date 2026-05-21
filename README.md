# Noto — Financial Planner & Personal Wealth Tracker

Personal financial dashboard untuk anak muda: cashflow, aset, utang, dan financial goals dalam satu tempat. Dibangun dengan Next.js (App Router) + TypeScript + TailwindCSS, siap dikembangkan jadi SaaS.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **TailwindCSS** — design tokens di `tailwind.config.ts`
- **Recharts** — grafik
- **lucide-react** — ikon
- **Zustand** — state (tema)
- **Supabase** — auth + Postgres (opsional, lihat di bawah)

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # opsional untuk MVP (jalan dengan mock data)
npm run dev
```

Buka http://localhost:3000 — otomatis redirect ke `/dashboard`.

## Struktur folder

```
src/
  app/
    (dashboard)/            # route group dengan sidebar + bottom-nav
      layout.tsx            # shell: Sidebar + MobileNav + MobileHeader
      dashboard/page.tsx    # ringkasan & net worth
      cash/page.tsx         # asset cash tracker (target & progress)
      cards/page.tsx        # credit card management
      summary/page.tsx      # analytics bulanan
    layout.tsx              # root: font, tema no-flash
    page.tsx                # redirect -> /dashboard
    globals.css             # design system (.card, animasi, gradient)
  components/
    ui/                     # Card, StatCard, ProgressBar, PageHeader (reusable)
    layout/                 # Sidebar, MobileNav, ThemeToggle, nav-config
    charts/                 # NetWorth, Donut, CashFlow, HealthGauge (Recharts)
  lib/
    finance.ts              # ENGINE: progress, utilization, net worth, health score
    format.ts               # rpShort / rpFull (format Rupiah)
    utils.ts                # cn() — merge className
    store.ts                # Zustand theme store (persist)
    supabase/               # client (browser) & server
  data/mock.ts              # mock data — sumber tunggal selama MVP
  types/index.ts            # tipe domain (dipakai app & row Supabase)
supabase/schema.sql         # skema DB + RLS, jalankan di Supabase SQL Editor
```

## Arsitektur singkat

- **Reusable components** — `Card`, `StatCard`, `ProgressBar`, `PageHeader` dipakai ulang di semua halaman; styling lewat util class `.card` di `globals.css`.
- **Calculation engine terpisah** (`lib/finance.ts`) — fungsi murni & mudah dites, lepas dari UI.
- **Mock-first** — semua halaman baca dari `data/mock.ts`. Saat Supabase siap, ganti sumber data tanpa ubah komponen.
- **Theme** — class `dark` di `<html>`, dipersist via Zustand; skrip kecil di root layout mencegah flash saat reload.

## Menyambungkan Supabase (langkah berikutnya)

1. Buat project di https://supabase.com
2. Jalankan `supabase/schema.sql` di SQL Editor (bikin tabel + Row Level Security).
3. Isi `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_USE_SUPABASE=true
   ```
4. Ganti pembacaan `data/mock.ts` di tiap page dengan query Supabase (client sudah tersedia di `lib/supabase/`).

> Auth flow (email/OAuth) dan middleware refresh sesi belum diaktifkan di MVP ini — server client sudah disiapkan agar tinggal ditambahkan.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di Vercel: **New Project → Import** repo ini (auto-detect Next.js).
3. Tambahkan environment variables (jika pakai Supabase) di Project Settings.
4. Deploy. Selesai.

## Roadmap (4 layar berikutnya)

Piutang, Utang & Cicilan, Emas/Investasi, Asset Lainnya — ikuti pola halaman yang sudah ada: tambah tipe di `types/`, data di `data/mock.ts`, lalu page baru di `app/(dashboard)/<nama>/`. Tabelnya sudah ada di `schema.sql`.
