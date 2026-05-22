import { createClient } from "@/lib/supabase/client";

/** Kalau Supabase return JWT error, refresh token dan coba lagi sekali. */
async function withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const msg = String(e);
    if (msg.includes("JWT") || msg.includes("token")) {
      const sb = createClient();
      await sb.auth.refreshSession();
      return await fn();
    }
    throw e;
  }
}

export type Repo<T> = {
  getAll: () => Promise<T[]>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<void>;
};

export function makeRepo<TRow, TDomain>(
  table: string,
  toApp: (row: TRow) => TDomain,
  fromApp: (domain: Omit<TDomain, "id">, userId: string) => Record<string, unknown>
): Repo<TDomain> {
  return {
    async getAll() {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return [];
      const { data, error } = await sb
        .from(table)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
      if (error) throw new Error(`[${table}] getAll: ${error.message}`);
      return (data as TRow[]).map(toApp);
    },

    async create(raw) {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const payload = fromApp(raw as Omit<TDomain, "id">, user.id);
      const { data, error } = await sb.from(table).insert(payload).select().single();
      if (error) throw new Error(`[${table}] create: ${error.message}`);
      return toApp(data as TRow);
    },

    async update(id, raw) {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const payload = fromApp(raw as Omit<TDomain, "id">, user.id);
      const { data, error } = await sb
        .from(table)
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw new Error(`[${table}] update: ${error.message}`);
      return toApp(data as TRow);
    },

    async remove(id) {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await sb.from(table).delete().eq("id", id).eq("user_id", user.id);
      if (error) throw new Error(`[${table}] delete: ${error.message}`);
    },
  };
}
