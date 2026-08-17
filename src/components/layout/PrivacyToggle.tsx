"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePrivacyStore } from "@/lib/store";
import { isMoneyHidden } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const UNLOCK_MINUTES = 30;
const RESET_PHRASE = "g1ch1";

function onlySixDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

type PrivacyMode = "unlock" | "reset";

export function PrivacyToggle() {
  const { pin, visibleUntil, lockMoney, setPin, resetPin, unlockFor } = usePrivacyStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PrivacyMode>("unlock");
  const [pinInput, setPinInput] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const hasPin = Boolean(pin);
  const hidden = isMoneyHidden();
  const Icon = hidden ? EyeOff : Eye;
  const isResetMode = mode === "reset";

  useEffect(() => {
    if (!visibleUntil || visibleUntil <= Date.now()) return;

    const timer = window.setTimeout(() => {
      lockMoney();
      window.location.reload();
    }, visibleUntil - Date.now());

    return () => window.clearTimeout(timer);
  }, [lockMoney, visibleUntil]);

  function resetForm(nextMode: PrivacyMode = "unlock") {
    setMode(nextMode);
    setErr("");
    setNotice("");
    setPinInput("");
    setConfirmPin("");
    setResetAnswer("");
  }

  function handleClick() {
    if (!hidden) {
      lockMoney();
      window.location.reload();
      return;
    }

    resetForm("unlock");
    setOpen(true);
  }

  function handleResetPin() {
    if (resetAnswer.trim() !== RESET_PHRASE) {
      setNotice("");
      setErr("Nama kucing belum cocok.");
      return;
    }

    resetPin();
    resetForm("unlock");
    setNotice("PIN lama sudah direset. Silakan buat PIN baru.");
  }

  function handleUnlock() {
    if (!/^\d{6}$/.test(pinInput)) {
      setNotice("");
      setErr("PIN harus 6 angka.");
      return;
    }

    if (!hasPin) {
      if (pinInput !== confirmPin) {
        setNotice("");
        setErr("Konfirmasi PIN belum sama.");
        return;
      }

      setPin(pinInput);
      unlockFor(UNLOCK_MINUTES);
      window.location.reload();
      return;
    }

    if (pinInput !== pin) {
      setNotice("");
      setErr("PIN salah.");
      return;
    }

    unlockFor(UNLOCK_MINUTES);
    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
        aria-label={hidden ? "Tampilkan nominal uang" : "Sembunyikan nominal uang"}
        aria-pressed={!hidden}
        className="grid h-10 w-10 place-items-center rounded-xl border border-black/[.08] bg-white text-ink-dim transition hover:shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      >
        <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isResetMode ? "Reset PIN Privacy" : hasPin ? "Masukkan PIN" : "Buat PIN Privacy"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            {isResetMode ? (
              <Button onClick={handleResetPin}>Reset PIN</Button>
            ) : (
              <Button onClick={handleUnlock}>{hasPin ? "Buka 30 menit" : "Buat & buka"}</Button>
            )}
          </>
        }
      >
        <div className="space-y-3.5">
          {isResetMode ? (
            <>
              <p className="text-muted text-[13.5px] leading-relaxed">
                Masukkan nama kucing untuk menghapus PIN lama. Setelah reset, nominal tetap
                tersembunyi sampai kamu membuat PIN baru.
              </p>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="privacy-reset-answer"
                  className="text-heading text-[13.5px] font-semibold"
                >
                  Nama kucing
                </label>
                <input
                  id="privacy-reset-answer"
                  type="password"
                  autoComplete="off"
                  value={resetAnswer}
                  onChange={(event) => {
                    setErr("");
                    setNotice("");
                    setResetAnswer(event.target.value);
                  }}
                  className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] font-semibold outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => resetForm("unlock")}
                className="text-[13px] font-bold text-amber-deep transition hover:opacity-80"
              >
                Kembali ke PIN
              </button>
            </>
          ) : (
            <>
              <p className="text-muted text-[13.5px] leading-relaxed">
                Nominal uang akan terlihat selama {UNLOCK_MINUTES} menit. Setelah itu Noto akan
                meminta PIN lagi.
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="privacy-pin" className="text-heading text-[13.5px] font-semibold">
                  PIN 6 angka
                </label>
                <input
                  id="privacy-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete={hasPin ? "current-password" : "new-password"}
                  maxLength={6}
                  value={pinInput}
                  onChange={(event) => {
                    setErr("");
                    setNotice("");
                    setPinInput(onlySixDigits(event.target.value));
                  }}
                  className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[18px] font-bold tracking-[.28em] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {!hasPin && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="privacy-pin-confirm"
                    className="text-heading text-[13.5px] font-semibold"
                  >
                    Konfirmasi PIN
                  </label>
                  <input
                    id="privacy-pin-confirm"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(event) => {
                      setErr("");
                      setNotice("");
                      setConfirmPin(onlySixDigits(event.target.value));
                    }}
                    className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[18px] font-bold tracking-[.28em] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              )}

              {hasPin && (
                <button
                  type="button"
                  onClick={() => resetForm("reset")}
                  className="text-[13px] font-bold text-amber-deep transition hover:opacity-80"
                >
                  Lupa PIN?
                </button>
              )}
            </>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-lg bg-pos-soft px-3 py-2 text-[13px] font-medium text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
            >
              {notice}
            </div>
          )}

          {err && (
            <div
              role="alert"
              className="rounded-lg bg-neg-soft px-3 py-2 text-[13px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
            >
              {err}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
