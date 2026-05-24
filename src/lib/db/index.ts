import { makeRepo } from "./repository";
import {
  toGoal,
  fromGoal,
  toReceivable,
  fromReceivable,
  toDebt,
  fromDebt,
  toCreditCard,
  fromCreditCard,
  toCardTransaction,
  fromCardTransaction,
  toGoldAsset,
  fromGoldAsset,
  toStockHolding,
  fromStockHolding,
  toOtherAsset,
  fromOtherAsset,
  toTransaction,
  fromTransaction,
  toRetirementFund,
  fromRetirementFund,
  toAssetTransfer,
  fromAssetTransfer,
} from "./mappers";
import type {
  GoalRow,
  ReceivableRow,
  DebtRow,
  CreditCardRow,
  CardTransactionRow,
  GoldAssetRow,
  StockHoldingRow,
  OtherAssetRow,
  TransactionRow,
  RetirementFundRow,
  AssetTransferRow,
} from "./types";
import type {
  Goal,
  Receivable,
  Debt,
  CreditCard,
  CardTransaction,
  GoldAsset,
  StockHolding,
  OtherAsset,
  Transaction,
  RetirementFund,
  AssetTransfer,
} from "@/types";

export const goalsRepo = makeRepo<GoalRow, Goal>("goals", toGoal, fromGoal);

export const receivablesRepo = makeRepo<ReceivableRow, Receivable>(
  "receivables",
  toReceivable,
  fromReceivable
);

export const debtsRepo = makeRepo<DebtRow, Debt>("debts", toDebt, fromDebt);

export const cardsRepo = makeRepo<CreditCardRow, CreditCard>(
  "credit_cards",
  toCreditCard,
  fromCreditCard
);

export const cardTxRepo = makeRepo<CardTransactionRow, CardTransaction>(
  "card_transactions",
  toCardTransaction,
  fromCardTransaction
);

export const goldRepo = makeRepo<GoldAssetRow, GoldAsset>(
  "gold_assets",
  toGoldAsset,
  fromGoldAsset
);

export const stocksRepo = makeRepo<StockHoldingRow, StockHolding>(
  "stock_holdings",
  toStockHolding,
  fromStockHolding
);

export const assetsRepo = makeRepo<OtherAssetRow, OtherAsset>(
  "other_assets",
  toOtherAsset,
  fromOtherAsset
);

export const transactionsRepo = makeRepo<TransactionRow, Transaction>(
  "transactions",
  toTransaction,
  fromTransaction
);

// NOTE:
// retirementPlansRepo sementara dimatikan karena mappers.ts belum export:
// toRetirementPlan dan fromRetirementPlan.
// Aktifkan lagi kalau mapper-nya sudah dibuat.
// export const retirementPlansRepo = makeRepo<RetirementPlanRow, RetirementPlan>(
//   "retirement_plans",
//   toRetirementPlan,
//   fromRetirementPlan
// );

export const retirementFundsRepo = makeRepo<RetirementFundRow, RetirementFund>(
  "retirement_funds",
  toRetirementFund,
  fromRetirementFund
);

export const assetTransfersRepo = makeRepo<AssetTransferRow, AssetTransfer>(
  "asset_transfers",
  toAssetTransfer,
  fromAssetTransfer
);

/**
 * Transfer atomik antar goal:
 * Kurangi usedAmount dari asal, tambah ke tujuan, insert log ke asset_transfers.
 */
export async function executeTransfer(
  fromGoal: { id: string; usedAmount: number },
  toGoal: { id: string; usedAmount: number },
  amount: number,
  date: string,
  note: string
): Promise<{ transfer: AssetTransfer }> {
  const sb = (await import("@/lib/supabase/client")).createClient();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const newFromAmount = Math.max(0, fromGoal.usedAmount - amount);
  const newToAmount = toGoal.usedAmount + amount;
  const now = new Date().toISOString();

  const [fromRes, toRes, transferRes] = await Promise.all([
    sb
      .from("goals")
      .update({ used_amount: newFromAmount, updated_at: now })
      .eq("id", fromGoal.id)
      .eq("user_id", user.id)
      .select("id")
      .single(),

    sb
      .from("goals")
      .update({ used_amount: newToAmount, updated_at: now })
      .eq("id", toGoal.id)
      .eq("user_id", user.id)
      .select("id")
      .single(),

    sb
      .from("asset_transfers")
      .insert({
        user_id: user.id,
        from_goal_id: fromGoal.id,
        to_goal_id: toGoal.id,
        amount,
        date,
        note: note || null,
      })
      .select()
      .single(),
  ]);

  if (fromRes.error) throw new Error("Gagal update asal: " + fromRes.error.message);
  if (toRes.error) throw new Error("Gagal update tujuan: " + toRes.error.message);
  if (transferRes.error) throw new Error("Gagal simpan transfer: " + transferRes.error.message);

  return { transfer: toAssetTransfer(transferRes.data as AssetTransferRow) };
}