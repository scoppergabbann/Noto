-- =============================================================
-- Noto — Database schema (PostgreSQL / Supabase)
-- Jalankan di Supabase SQL Editor.
-- =============================================================

-- Setiap baris data terikat ke user lewat user_id (auth.users).
-- Row Level Security (RLS) memastikan user hanya bisa akses datanya sendiri.

-- ---------- GOALS / Asset Cash ----------
create table if not exists goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  item            text not null,
  instrument      text,
  target_amount   numeric(15,2) not null default 0,
  used_amount     numeric(15,2) not null default 0,
  deadline        date,
  duration_months int,
  color           text default '#6b6ff0',
  emoji           text default '🎯',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ---------- RECEIVABLES / Piutang ----------
create table if not exists receivables (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item       text not null,
  debtor     text,
  total      numeric(15,2) not null default 0,
  paid       numeric(15,2) not null default 0,
  due_date   text,
  notes      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- DEBTS / Utang & Cicilan ----------
create table if not exists debts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item       text not null,
  creditor   text,
  total      numeric(15,2) not null default 0,
  paid       numeric(15,2) not null default 0,
  due_date   text,
  notes      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- CREDIT CARDS ----------
create table if not exists credit_cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  credit_limit numeric(15,2) not null default 0,
  spent        numeric(15,2) not null default 0,
  paid         numeric(15,2) not null default 0,
  gradient     text,
  last4        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ---------- GOLD / Asset Non-Cash ----------
create table if not exists gold_assets (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  item                  text not null,
  category              text check (category in ('savings','investment')) default 'investment',
  bought_grams          numeric(10,3) not null default 0,
  sold_grams            numeric(10,3) not null default 0,
  buy_value             numeric(15,2) not null default 0,
  used_value            numeric(15,2) not null default 0,
  current_price_per_gram numeric(15,2) not null default 0,
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ---------- OTHER ASSETS ----------
create table if not exists other_assets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  item          text not null,
  emoji         text default '📦',
  unit          text,
  quantity      numeric(10,2) not null default 1,
  current_value numeric(15,2) not null default 0,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ---------- TRANSACTIONS ----------
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text check (type in ('income','expense')) not null,
  category    text not null default '',
  amount      numeric(15,2) not null,
  date        date not null default current_date,
  note        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table goals         enable row level security;
alter table receivables   enable row level security;
alter table debts         enable row level security;
alter table credit_cards  enable row level security;
alter table gold_assets   enable row level security;
alter table other_assets  enable row level security;
alter table transactions  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['goals','receivables','debts','credit_cards','gold_assets','other_assets','transactions']
  loop
    execute format('drop policy if exists "select own" on %I;', t);
    execute format('drop policy if exists "insert own" on %I;', t);
    execute format('drop policy if exists "update own" on %I;', t);
    execute format('drop policy if exists "delete own" on %I;', t);
    execute format('create policy "select own" on %I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert own" on %I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update own" on %I for update using (auth.uid() = user_id);', t);
    execute format('create policy "delete own" on %I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- Index untuk query per-user
create index if not exists idx_goals_user       on goals(user_id);
create index if not exists idx_receivables_user on receivables(user_id);
create index if not exists idx_debts_user       on debts(user_id);
create index if not exists idx_cards_user       on credit_cards(user_id);
create index if not exists idx_gold_user        on gold_assets(user_id);
create index if not exists idx_other_user       on other_assets(user_id);
create index if not exists idx_tx_user_date     on transactions(user_id, date desc);
