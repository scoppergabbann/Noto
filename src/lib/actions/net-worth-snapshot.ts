'use server'

import { createClient } from '@/lib/supabase/server'

type NetWorthSnapshotPoint = {
  month: string
  asset: number
  liability: number
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function getCurrentSnapshotMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

function formatMonthKey(date: string): string {
  const d = new Date(date)

  if (Number.isNaN(d.getTime())) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function selectUserRows(table: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error(`[net-worth-snapshot] gagal ambil ${table}:`, error.message)
    return []
  }

  return data ?? []
}

export async function generateCurrentMonthNetWorthSnapshot() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const userId = user.id
  const snapshotMonth = getCurrentSnapshotMonth()

  const [
  goalsRows,
  cashMovementRows,
  debtsRows,
  goldRows,
  otherAssetRows,
  receivableRows,
  retirementFundRows,
  creditCardRows,
  stockRows,
] = await Promise.all([
  selectUserRows('goals', userId),
  selectUserRows('cash_movements', userId),
  selectUserRows('debts', userId),
  selectUserRows('gold_assets', userId),
  selectUserRows('other_assets', userId),
  selectUserRows('receivables', userId),
  selectUserRows('retirement_funds', userId),
  selectUserRows('credit_cards', userId),
  selectUserRows('stock_holdings', userId),
])

  /**
   * Di dashboard kamu, goals dipakai sebagai cash/tabungan.
   */
  const goalsCash = goalsRows.reduce((sum, row) => {
  return sum + toNumber(row.used_amount)
}, 0)

const movementCash = cashMovementRows.reduce((sum, row) => {
  const type = String(row.type ?? 'in')
  const amount = toNumber(row.amount)

  if (type === 'in') return sum + amount
  if (type === 'out') return sum - amount

  return sum
}, 0)

/**
 * Untuk sementara:
 * Jika cash_movements sudah ada, pakai movementCash sebagai sumber cash.
 * Jika belum ada, fallback ke goals.used_amount agar data lama tetap aman.
 */
const totalCash = cashMovementRows.length > 0 ? movementCash : goalsCash

  const totalGold = goldRows.reduce((sum, row) => {
    const boughtGrams = toNumber(row.bought_grams)
    const soldGrams = toNumber(row.sold_grams)
    const currentPricePerGram = toNumber(row.current_price_per_gram)
    const remainingGrams = Math.max(boughtGrams - soldGrams, 0)

    return sum + remainingGrams * currentPricePerGram
  }, 0)

  const totalOtherAssets = otherAssetRows.reduce((sum, row) => {
    return sum + toNumber(row.current_value)
  }, 0)

  const totalReceivables = receivableRows.reduce((sum, row) => {
    const total = toNumber(row.total)
    const paid = toNumber(row.paid)
    const unpaid = Math.max(total - paid, 0)

    return sum + unpaid
  }, 0)

  const totalRetirementFunds = retirementFundRows.reduce((sum, row) => {
    return sum + toNumber(row.current_value)
  }, 0)

  /**
   * Saham Indonesia umumnya 1 lot = 100 lembar.
   * Ini mengikuti pola umum stockMarketValue(lots, currentPrice).
   */
  const totalStocks = stockRows.reduce((sum, row) => {
    const lots = toNumber(row.lots)
    const currentPrice = toNumber(row.current_price)

    return sum + lots * 100 * currentPrice
  }, 0)

  const totalDebtsOnly = debtsRows.reduce((sum, row) => {
    const total = toNumber(row.total)
    const paid = toNumber(row.paid)
    const remaining = Math.max(total - paid, 0)

    return sum + remaining
  }, 0)

  const totalCreditCards = creditCardRows.reduce((sum, row) => {
    const spent = toNumber(row.spent)
    const paid = toNumber(row.paid)
    const outstanding = Math.max(spent - paid, 0)

    return sum + outstanding
  }, 0)

  const totalAssets =
    totalCash +
    totalGold +
    totalOtherAssets +
    totalReceivables +
    totalRetirementFunds +
    totalStocks

  const totalDebts = totalDebtsOnly + totalCreditCards
  const netWorth = totalAssets - totalDebts

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .upsert(
      {
        user_id: userId,

        /**
         * Kolom baru.
         */
        snapshot_month: snapshotMonth,
        total_cash: totalCash,
        total_assets: totalAssets,
        total_debts: totalDebts,
        total_stocks: totalStocks,
        net_worth: netWorth,

        /**
         * Kolom lama tetap diisi agar backward compatible
         * dengan struktur table kamu sekarang.
         */
        month: snapshotMonth,
        total_asset: totalAssets,
        total_debt: totalDebts,
      },
      {
        onConflict: 'user_id,snapshot_month',
      }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Snapshot upsert error: ${error.message}`)
  }

  return data
}

export async function generateNetWorthSnapshotsFromCashMovements() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const userId = user.id

  const [
    cashMovementRows,
    debtsRows,
    goldRows,
    otherAssetRows,
    receivableRows,
    retirementFundRows,
    creditCardRows,
    stockRows,
  ] = await Promise.all([
    selectUserRows('cash_movements', userId),
    selectUserRows('debts', userId),
    selectUserRows('gold_assets', userId),
    selectUserRows('other_assets', userId),
    selectUserRows('receivables', userId),
    selectUserRows('retirement_funds', userId),
    selectUserRows('credit_cards', userId),
    selectUserRows('stock_holdings', userId),
  ])

  const monthKeys = Array.from(
    new Set(
      cashMovementRows
        .map((row) => String(row.movement_date ?? ''))
        .filter(Boolean)
        .map((date) => date.slice(0, 7))
    )
  ).sort()

  if (monthKeys.length === 0) {
    return []
  }

  const totalGold = goldRows.reduce((sum, row) => {
    const boughtGrams = toNumber(row.bought_grams)
    const soldGrams = toNumber(row.sold_grams)
    const currentPricePerGram = toNumber(row.current_price_per_gram)
    const remainingGrams = Math.max(boughtGrams - soldGrams, 0)

    return sum + remainingGrams * currentPricePerGram
  }, 0)

  const totalOtherAssets = otherAssetRows.reduce((sum, row) => {
    return sum + toNumber(row.current_value)
  }, 0)

  const totalReceivables = receivableRows.reduce((sum, row) => {
    const total = toNumber(row.total)
    const paid = toNumber(row.paid)
    const unpaid = Math.max(total - paid, 0)

    return sum + unpaid
  }, 0)

  const totalRetirementFunds = retirementFundRows.reduce((sum, row) => {
    return sum + toNumber(row.current_value)
  }, 0)

  const totalStocks = stockRows.reduce((sum, row) => {
    const lots = toNumber(row.lots)
    const currentPrice = toNumber(row.current_price)

    return sum + lots * 100 * currentPrice
  }, 0)

  const totalDebtsOnly = debtsRows.reduce((sum, row) => {
    const total = toNumber(row.total)
    const paid = toNumber(row.paid)
    const remaining = Math.max(total - paid, 0)

    return sum + remaining
  }, 0)

  const totalCreditCards = creditCardRows.reduce((sum, row) => {
    const spent = toNumber(row.spent)
    const paid = toNumber(row.paid)
    const outstanding = Math.max(spent - paid, 0)

    return sum + outstanding
  }, 0)

  const staticAssets =
    totalGold +
    totalOtherAssets +
    totalReceivables +
    totalRetirementFunds +
    totalStocks

  const totalDebts = totalDebtsOnly + totalCreditCards

  const snapshots = monthKeys.map((monthKey) => {
    const endOfMonth = `${monthKey}-31`

    const cumulativeCash = cashMovementRows.reduce((sum, row) => {
      const movementDate = String(row.movement_date ?? '')
      if (!movementDate || movementDate > endOfMonth) return sum

      const type = String(row.type ?? 'in')
      const amount = toNumber(row.amount)

      if (type === 'in') return sum + amount
      if (type === 'out') return sum - amount

      return sum
    }, 0)

    const snapshotMonth = `${monthKey}-01`
    const totalAssets = cumulativeCash + staticAssets
    const netWorth = totalAssets - totalDebts

    return {
      user_id: userId,

      snapshot_month: snapshotMonth,
      total_cash: cumulativeCash,
      total_assets: totalAssets,
      total_debts: totalDebts,
      total_stocks: totalStocks,
      net_worth: netWorth,

      month: snapshotMonth,
      total_asset: totalAssets,
      total_debt: totalDebts,
    }
  })

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .upsert(snapshots, {
      onConflict: 'user_id,snapshot_month',
    })
    .select()

  if (error) {
    throw new Error(`Gagal generate historical snapshots: ${error.message}`)
  }

  return data ?? []
}

export async function getNetWorthSnapshots(): Promise<NetWorthSnapshotPoint[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select(
      `
      id,
      snapshot_month,
      month,
      total_assets,
      total_asset,
      total_debts,
      total_debt,
      net_worth
    `
    )
    .eq('user_id', user.id)
    .order('snapshot_month', { ascending: true })

  if (error) {
    throw new Error(`Get snapshots error: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const rawMonth = String(row.snapshot_month ?? row.month ?? getCurrentSnapshotMonth())

    return {
      month: formatMonthKey(rawMonth),
      asset: toNumber(row.total_assets ?? row.total_asset),
      liability: toNumber(row.total_debts ?? row.total_debt),
    }
  })
}