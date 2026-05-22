# Setup Supabase untuk Noto

## 1. Buat Supabase Project

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project, password database, pilih region terdekat (Singapore)
3. Tunggu ~2 menit hingga project siap

## 2. Jalankan Schema Database

1. Di dashboard Supabase → **SQL Editor** → **New query**
2. Copy-paste seluruh isi file `supabase/schema.sql`
3. Klik **Run** — seharusnya muncul pesan sukses
4. Cek di **Table Editor** — harus ada 7 tabel: `goals`, `receivables`, `debts`, `credit_cards`, `gold_assets`, `other_assets`, `transactions`

## 3. Aktifkan Email Auth

1. Supabase Dashboard → **Authentication** → **Providers**
2. Pastikan **Email** sudah enabled (default: on)
3. Optional: matikan "Confirm email" kalau mau tes cepat tanpa verifikasi email
   (Authentication → Email Templates → Confirm signup → toggle off)

## 4. Isi Environment Variables

1. Supabase Dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Rename `.env.local.example` → `.env.local`
4. Isi dengan nilai yang dicopy:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Jalankan Noto

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → akan redirect ke `/login`.

Daftar akun baru via `/register`, lalu login — semua data tersimpan ke Supabase!

## Troubleshooting

| Error | Solusi |
|-------|--------|
| "Invalid API key" | Pastikan anon key sudah benar di `.env.local` |
| "Row Level Security" error | Pastikan schema.sql sudah dijalankan di SQL Editor |
| Redirect loop ke /login | Cek SUPABASE_URL sudah benar (tidak ada trailing slash) |
| Data tidak muncul setelah login | Cek browser console — pastikan tidak ada network error ke Supabase |

## Struktur Database

```
goals           → target tabungan / asset cash
receivables     → piutang (orang yang berhutang ke kamu)
debts           → utang & cicilan
credit_cards    → kartu kredit
gold_assets     → emas & investasi
other_assets    → asset lainnya (properti, kendaraan, dll.)
transactions    → transaksi (income/expense) untuk Summary
```

Semua tabel dilindungi **Row Level Security** — setiap user hanya bisa akses datanya sendiri.
