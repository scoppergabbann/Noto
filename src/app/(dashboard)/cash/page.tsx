"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ArrowLeftRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CashMovementForm } from "@/components/forms/CashMovementForm";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { GoalForm, type GoalDraft } from "./GoalForm";
import { TransferForm, type TransferDraft } from "./TransferForm";
import { useGoalsStore, useAssetTransfersStore } from "@/lib/stores";
import { executeTransfer } from "@/lib/db";
import { progressPct, remaining, monthlyTarget } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Goal } from "@/types";

// Tab: "goals" | "history"
type Tab = "goals" | "movements" | "history";

export default function CashPage() {
  const { items, loading, error, fetch, add, update, remove } = useGoalsStore();
  const { items: transfers, loading: txLoading, fetch: fetchTransfers } = useAssetTransfersStore();

  const goals = items;

  const [tab, setTab] = useState<Tab>("goals");
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [cashMovementOpen, setCashMovementOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
  fetchTransfers();
}, [fetchTransfers]);

useEffect(() => {
  if (tab === "history") {
    fetchTransfers();
  }
}, [tab, fetchTransfers]);

  // Aggregations
  const totalUsed = goals.reduce((s, g) => s + g.usedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const monthlySum = goals.reduce(
    (s, g) => s + monthlyTarget(g.targetAmount, g.usedAmount, g.durationMonths || 6),
    0
  );
  const overallPct = progressPct(totalUsed, totalTarget);

  // Lookup goal name by id (untuk history)
  const goalMap = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);

  // Transfers sorted newest first
  const sortedTransfers = useMemo(
    () => [...transfers].sort((a, b) => b.date.localeCompare(a.date)),
    [transfers]
  );

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(g: Goal) {
    setEditing(g);
    setFormOpen(true);
  }
  function handleGoalSubmit(d: GoalDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  async function handleTransfer(d: TransferDraft) {
    const fromGoal = goals.find((g) => g.id === d.fromGoalId);
    const toGoal = goals.find((g) => g.id === d.toGoalId);
    if (!fromGoal || !toGoal) throw new Error("Asset tidak ditemukan.");

    await executeTransfer(
      { id: fromGoal.id, usedAmount: fromGoal.usedAmount },
      { id: toGoal.id, usedAmount: toGoal.usedAmount },
      d.amount,
      d.date,
      d.note
    );

    // Refresh kedua store setelah transfer
    await Promise.all([fetch(), fetchTransfers()]);
  }

  if (loading) return <LoadingState label="Memuat asset cash…" />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Tabungan"
        title={
          <>
            Tabungan & <em className="italic text-amber-text dark:text-amber">goal</em> finansialmu.
          </>
        }
        action={
          <div className="flex items-center gap-2">
            {goals.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCashMovementOpen(true)}
                aria-label="Tambah atau tarik dana"
              >
                <Plus size={16} strokeWidth={2.2} />
                <span className="hidden sm:inline">Tambah Dana</span>
                <span className="sm:hidden">Dana</span>
              </Button>
            )}

            {goals.length >= 2 && (
              <Button
                variant="secondary"
                onClick={() => setTransferOpen(true)}
                aria-label="Transfer antar asset"
              >
                <ArrowLeftRight size={16} strokeWidth={2.2} />
                <span className="hidden sm:inline">Transfer</span>
              </Button>
            )}

            <Button onClick={openNew}>
              <Plus size={17} strokeWidth={2.4} />
              <span className="hidden sm:inline">Tambah goal</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        }
      />

      {/* Summary stats */}
      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Total Terkumpul", rpShort(totalUsed), "text-heading"],
          ["Total Target", rpShort(totalTarget), "text-heading"],
          [
            "Progress",
            `${overallPct}%`,
            overallPct >= 80 ? "text-pos-strong dark:text-pos-dark" : "text-heading",
          ],
          ["Target/bulan", rpShort(monthlySum), "text-heading"],
        ].map(([label, value, cls]) => (
          <Card key={label} hoverable>
            <div className="text-muted text-[12.5px] font-semibold">{label}</div>
            <div
              className={`mt-1.5 font-serif text-[19px] font-semibold tabular-nums sm:text-[22px] ${cls}`}
            >
              {value}
            </div>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="mb-4 flex gap-1 rounded-xl bg-surface-sunken p-1 dark:bg-white/5">
        {(["goals", "movements", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold transition ${
              tab === t
                ? "bg-white text-ink shadow-soft dark:bg-white/10 dark:text-slate-100"
                : "text-muted hover:text-heading"
            }`}
          >
            {t === "goals" ? (
              <>
                Goals <Badge tone="indigo">{goals.length}</Badge>
              </>
            )  : t === "movements" ? (
              <>
                <Plus size={15} className="shrink-0" aria-hidden="true" />
                Mutasi Dana
              </>
            )  : (
              <>
                <Clock size={15} className="shrink-0" aria-hidden="true" />
                Riwayat Transfer <Badge tone="indigo">{transfers.length}</Badge>
              </>
            )}
          </button>
        ))}
      </div>

      {/* ---- Tab: Goals ---- */}
      {tab === "goals" && (
        <>
          {goals.length === 0 ? (
            <Card className="py-10 text-center sm:py-14">
              <div className="mb-3 text-[40px]" aria-hidden="true">
                🎯
              </div>
              <div className="text-heading mb-1 font-serif text-[18px] font-semibold">
                Belum ada goal
              </div>
              <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
                Tambahkan tabungan atau goal finansial pertamamu.
              </div>
              <Button onClick={openNew} className="mx-auto">
                <Plus size={17} strokeWidth={2.4} /> Tambah goal
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {goals.map((g) => {
                const pct = progressPct(g.usedAmount, g.targetAmount);
                const rem = remaining(g.targetAmount, g.usedAmount);
                const mt = monthlyTarget(g.targetAmount, g.usedAmount, g.durationMonths || 6);
                const done = pct >= 100;

                return (
                  <Card key={g.id} hoverable>
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[22px]"
                        style={{ background: `${g.color}1f` }}
                        aria-hidden="true"
                      >
                        {g.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-heading truncate text-[15px] font-semibold">
                          {g.item}
                        </div>
                        {g.instrument && (
                          <div className="text-subtle truncate text-[12.5px]">{g.instrument}</div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {done && <Badge tone="green">Tercapai 🎉</Badge>}
                        <RowActions onEdit={() => openEdit(g)} onDelete={() => setDeleteId(g.id)} />
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-2 flex items-baseline justify-between gap-2 text-[13px]">
                      <span className="text-heading font-semibold tabular-nums">
                        {rpShort(g.usedAmount)}
                      </span>
                      <span className="text-muted tabular-nums">/ {rpShort(g.targetAmount)}</span>
                      <span className="ml-auto font-bold tabular-nums" style={{ color: g.color }}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      color={g.color}
                      height={9}
                      label={`${g.item} progress ${pct}%`}
                    />

                    {/* Stats bawah */}
                    {!done && (
                      <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
                        <div>
                          <div className="text-subtle text-[11.5px]">Sisa</div>
                          <div className="text-heading font-semibold tabular-nums">
                            {rpShort(rem)}
                          </div>
                        </div>
                        {mt > 0 && g.durationMonths > 0 && (
                          <div>
                            <div className="text-subtle text-[11.5px]">Target/bulan</div>
                            <div className="text-heading font-semibold tabular-nums">
                              {rpShort(mt)}
                            </div>
                          </div>
                        )}
                        {g.deadline && (
                          <div className="col-span-2">
                            <div className="text-subtle text-[11.5px]">Deadline</div>
                            <div className="text-heading font-semibold">{g.deadline}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {g.notes && <div className="text-subtle mt-3 text-[12.5px]">📝 {g.notes}</div>}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ---- Tab: Mutasi Dana ---- */}
      {tab === "movements" && (
        <Card>
          <div className="mb-5">
            <h2 className="text-heading font-serif text-[18px] font-semibold">
              Mutasi Dana
            </h2>
            <p className="text-muted mt-1 text-[13.5px] leading-relaxed">
              Catat uang masuk atau keluar dari goal agar histori cash terbaca per bulan.
            </p>
          </div>

          {goals.length === 0 ? (
            <div className="py-10 text-center sm:py-14">
              <div className="mb-3 text-[40px]" aria-hidden="true">
                🎯
              </div>
              <div className="text-heading mb-1 font-serif text-[18px] font-semibold">
                Belum ada goal
              </div>
              <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
                Buat goal terlebih dahulu sebelum menambahkan mutasi dana.
              </div>
              <Button onClick={openNew} className="mx-auto">
                <Plus size={17} strokeWidth={2.4} /> Tambah goal
              </Button>
            </div>
          ) : (
            <CashMovementForm
              goals={goals.map((goal) => ({
                id: goal.id,
                item: goal.item,
              }))}
              onSuccess={async () => {
                await fetch();
                setCashMovementOpen(false);
              }}
            />
          )}
        </Card>
      )}

      {/* ---- Tab: Riwayat Transfer ---- */}
      {tab === "history" && (
        <Card>
          {txLoading ? (
            <LoadingState label="Memuat riwayat…" />
          ) : sortedTransfers.length === 0 ? (
            <div className="py-10 text-center sm:py-14">
              <div className="mb-3 text-[40px]" aria-hidden="true">
                🔄
              </div>
              <div className="text-heading mb-1 font-serif text-[18px] font-semibold">
                Belum ada transfer
              </div>
              <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
                Gunakan tombol Transfer untuk memindahkan saldo antar goal.
              </div>
              {goals.length >= 2 && (
                <Button onClick={() => setTransferOpen(true)} className="mx-auto">
                  <ArrowLeftRight size={16} /> Buat transfer
                </Button>
              )}
            </div>
          ) : (
            <ul>
              {sortedTransfers.map((t, i) => {
                const from = goalMap.get(t.fromGoalId);
                const to = goalMap.get(t.toGoalId);
                return (
                  <li
                    key={t.id}
                    className={`flex min-h-[64px] items-center gap-3.5 py-3.5 ${
                      i < sortedTransfers.length - 1
                        ? "border-b border-black/5 dark:border-white/5"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500">
                      <ArrowLeftRight size={17} strokeWidth={2} aria-hidden="true" />
                    </div>

                    {/* From → To */}
                    <div className="min-w-0 flex-1">
                      <div className="text-heading flex flex-wrap items-center gap-1.5 text-[14px] font-semibold">
                        <span className="max-w-[100px] truncate sm:max-w-none">
                          {from ? `${from.emoji} ${from.item}` : "—"}
                        </span>
                        <ArrowLeftRight
                          size={13}
                          className="text-muted shrink-0"
                          aria-hidden="true"
                        />
                        <span className="max-w-[100px] truncate sm:max-w-none">
                          {to ? `${to.emoji} ${to.item}` : "—"}
                        </span>
                      </div>
                      <div className="text-subtle mt-0.5 flex items-center gap-2 text-[12.5px]">
                        <span>{t.date}</span>
                        {t.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{t.note}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <div className="text-heading font-serif text-[15px] font-bold tabular-nums">
                        {rpShort(t.amount)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* Forms */}
      <GoalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleGoalSubmit}
        initial={editing}
      />

      <TransferForm
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSubmit={handleTransfer}
        goals={goals}
        loading={loading}
      />

      {cashMovementOpen && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl bg-white p-4 shadow-softlg dark:bg-night-raised">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-heading font-serif text-[18px] font-semibold">
                Tambah / Tarik Dana
              </h2>
              <p className="text-muted mt-1 text-[13px]">
                Catat dana masuk atau keluar dari goal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCashMovementOpen(false)}
              className="rounded-xl px-3 py-1.5 text-[13px] font-bold text-muted transition hover:bg-surface-sunken hover:text-heading"
            >
              Tutup
            </button>
          </div>

          <CashMovementForm
            goals={goals.map((goal) => ({
              id: goal.id,
              item: goal.item,
            }))}
            onSuccess={async () => {
              await fetch();
              setCashMovementOpen(false);
            }}
          />
        </div>
      </div>
    )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus goal?"
        message="Goal dan semua datanya akan dihapus permanen."
      />
    </>
  );
}
