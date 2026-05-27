'use server'

import { createClient } from '@/lib/supabase/server'

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

type CreateCashMovementInput = {
  goalId?: string | null
  type: 'in' | 'out'
  category?: string
  amount: number
  movementDate: string
  note?: string
}

export async function createCashMovement(input: CreateCashMovementInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const amount = Math.abs(toNumber(input.amount))

  if (amount <= 0) {
    throw new Error('Nominal harus lebih dari 0')
  }

  if (!input.movementDate) {
    throw new Error('Tanggal wajib diisi')
  }

  const { data: movement, error: movementError } = await supabase
    .from('cash_movements')
    .insert({
      user_id: user.id,
      goal_id: input.goalId ?? null,
      type: input.type,
      category: input.category ?? 'manual',
      amount,
      movement_date: input.movementDate,
      note: input.note ?? null,
    })
    .select()
    .single()

  if (movementError) {
    throw new Error(`Gagal membuat cash movement: ${movementError.message}`)
  }

  if (input.goalId) {
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('used_amount')
      .eq('id', input.goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError) {
      throw new Error(`Gagal membaca goal: ${goalError.message}`)
    }

    const currentUsedAmount = toNumber(goal?.used_amount)

    const nextUsedAmount =
      input.type === 'in'
        ? currentUsedAmount + amount
        : Math.max(currentUsedAmount - amount, 0)

    const { error: updateGoalError } = await supabase
      .from('goals')
      .update({
        used_amount: nextUsedAmount,
      })
      .eq('id', input.goalId)
      .eq('user_id', user.id)

    if (updateGoalError) {
      throw new Error(`Gagal update saldo goal: ${updateGoalError.message}`)
    }
  }

  return movement
}

export async function getCashMovements() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('cash_movements')
    .select(`
      id,
      goal_id,
      type,
      category,
      amount,
      movement_date,
      note,
      created_at
    `)
    .eq('user_id', user.id)
    .order('movement_date', { ascending: false })

  if (error) {
    throw new Error(`Gagal mengambil cash movements: ${error.message}`)
  }

  return data ?? []
}