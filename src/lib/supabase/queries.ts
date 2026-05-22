import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  GoldAsset,
  OtherAsset,
  Transaction,
} from "@/types";

// ---------- GOALS ----------
export const goalsQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapGoal);
  },

  async create(supabase: SupabaseClient, userId: string, goal: Omit<Goal, "id">): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .insert([{ ...goal, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapGoal(data);
  },

  async update(supabase: SupabaseClient, id: string, patch: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapGoal(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- RECEIVABLES ----------
export const receivablesQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<Receivable[]> {
    const { data, error } = await supabase
      .from("receivables")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReceivable);
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    rx: Omit<Receivable, "id">
  ): Promise<Receivable> {
    const { data, error } = await supabase
      .from("receivables")
      .insert([{ ...rx, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapReceivable(data);
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Receivable>
  ): Promise<Receivable> {
    const { data, error } = await supabase
      .from("receivables")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapReceivable(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("receivables").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- DEBTS ----------
export const debtsQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<Debt[]> {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDebt);
  },

  async create(supabase: SupabaseClient, userId: string, debt: Omit<Debt, "id">): Promise<Debt> {
    const { data, error } = await supabase
      .from("debts")
      .insert([{ ...debt, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapDebt(data);
  },

  async update(supabase: SupabaseClient, id: string, patch: Partial<Debt>): Promise<Debt> {
    const { data, error } = await supabase
      .from("debts")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapDebt(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- CREDIT CARDS ----------
export const cardsQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCard);
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    card: Omit<CreditCard, "id">
  ): Promise<CreditCard> {
    const { data, error } = await supabase
      .from("credit_cards")
      .insert([{ ...card, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapCard(data);
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<CreditCard>
  ): Promise<CreditCard> {
    const { data, error } = await supabase
      .from("credit_cards")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapCard(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- GOLD ----------
export const goldQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<GoldAsset[]> {
    const { data, error } = await supabase
      .from("gold_assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapGold);
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    gold: Omit<GoldAsset, "id">
  ): Promise<GoldAsset> {
    const { data, error } = await supabase
      .from("gold_assets")
      .insert([{ ...gold, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapGold(data);
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<GoldAsset>
  ): Promise<GoldAsset> {
    const { data, error } = await supabase
      .from("gold_assets")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapGold(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("gold_assets").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- OTHER ASSETS ----------
export const assetsQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<OtherAsset[]> {
    const { data, error } = await supabase
      .from("other_assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapAsset);
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    asset: Omit<OtherAsset, "id">
  ): Promise<OtherAsset> {
    const { data, error } = await supabase
      .from("other_assets")
      .insert([{ ...asset, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapAsset(data);
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<OtherAsset>
  ): Promise<OtherAsset> {
    const { data, error } = await supabase
      .from("other_assets")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapAsset(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("other_assets").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- TRANSACTIONS ----------
export const transactionsQueries = {
  async list(supabase: SupabaseClient, userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapTransaction);
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    tx: Omit<Transaction, "id">
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...tx, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return mapTransaction(data);
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Transaction>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapTransaction(data);
  },

  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- MAPPERS (DB → TS type) ----------
const mapGoal = (row: any): Goal => ({ ...row });
const mapReceivable = (row: any): Receivable => ({ ...row });
const mapDebt = (row: any): Debt => ({ ...row });
const mapCard = (row: any): CreditCard => ({ ...row });
const mapGold = (row: any): GoldAsset => ({ ...row });
const mapAsset = (row: any): OtherAsset => ({ ...row });
const mapTransaction = (row: any): Transaction => ({ ...row });
