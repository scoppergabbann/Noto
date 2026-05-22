# Supabase Setup Guide

## 1. Create Supabase Project
- Buka https://supabase.com/dashboard
- Klik "New Project"
- Isi nama project, region (pilih terdekat, misal Singapore)
- Tunggu setup selesai (~2 menit)

## 2. Setup Database Schema
- Di Supabase dashboard, buka "SQL Editor"
- Copy seluruh isi `supabase/schema.sql` dari project
- Paste dan jalankan

## 3. Enable Row Level Security (RLS)
- Buka "Authentication" → "Policies"
- Untuk setiap table (goals, receivables, debts, credit_cards, gold_assets, other_assets, transactions):
  - Buka table
  - Klik "Enable RLS"
  - Klik "Create Policy" → pilih "Full customization"
  - Nama: `Enable read for own user` → `SELECT` → masukkan condition: `(auth.uid() = user_id)`
  - Create Policy lagi: `Enable insert for own user` → `INSERT` → `(auth.uid() = user_id)`
  - Create Policy lagi: `Enable update for own user` → `UPDATE` → `(auth.uid() = user_id)`
  - Create Policy lagi: `Enable delete for own user` → `DELETE` → `(auth.uid() = user_id)`

## 4. Get API Credentials
- Buka "Project Settings" → "Configuration" → "API"
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` di `.env.local`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local`

## 5. Enable Email/Password Auth
- Buka "Authentication" → "Providers"
- Pastikan "Email" sudah enabled
- Jika perlu, setup "Confirm email" di Authentication → Settings

## 6. Run App
```bash
npm install
npm run dev
# Buka http://localhost:3000
# Klik "Daftar" untuk membuat akun baru
# Login dengan email & password
```

## Troubleshooting

**Error: "could not read configuration"**
- Pastikan `.env.local` ada dan benar

**Error: "column user_id does not exist"**
- Jalankan schema.sql di SQL Editor sekali lagi

**Error: "permission denied for schema"**
- Pergi ke Supabase → Authentication → Policies → pastikan setiap table sudah punya policy

**Data tidak terlihat setelah login**
- Verifikasi Anda sudah login (cek email di Auth → Users)
- Cek browser console untuk error message
