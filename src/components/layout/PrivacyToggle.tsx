"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePrivacyStore } from "@/lib/store";
import { isMoneyHidden } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const UNLOCK_MINUTES = 30;

function onlySixDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function PrivacyToggle() {
  const { pin, visibleUntil, lockMoney, setPin, unlockFor } = usePrivacyStore();
  const [open, setOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [err, setErr] = useState("");

  const hasPin = Boolean(pin);
  const hidden = isMoneyHidden();
  const Icon = hidden ? EyeOff : Eye;

  useEffect(() => {
    if (!visibleUntil || visibleUntil <= Date.now()) return;

    const timer = window.setTimeout(() => {
      lockMoney();
      window.location.reload();
    }, visibleUntil - Date.now());

    return () => window.clearTimeout(timer);
  }, [lockMoney, visibleUntil]);

  function handleClick() {
    if (!hidden) {
      lockMoney();
      window.location.reload();
      return;
    }

    setErr("");
    setPinInput("");
    setConfirmPin("");
    setOpen(true);
  }

  function handleUnlock() {
    if (!/^\d{6}$/.test(pinInput)) {
      setErr("PIN harus 6 angka.");
      return;
    }

    if (!hasPin) {
      if (pinInput !== confirmPin) {
        setErr("Konfirmasi PIN belum sama.");
        return;
      }

      setPin(pinInput);
      unlockFor(UNLOCK_MINUTES);
      window.location.reload();
      return;
    }

    if (pinInput !== pin) {
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
        title={hasPin ? "Masukkan PIN" : "Buat PIN Privacy"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUnlock}>{hasPin ? "Buka 30 menit" : "Buat & buka"}</Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <p className="text-muted text-[13.5px] leading-relaxed">
            Nominal uang akan terlihat selama {UNLOCK_MINUTES} menit. Setelah itu Noto akan meminta
            PIN lagi.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="privacy-pin" className="text-heading text-[13.5px] font-semibold">
              PIN 6 angka
            </label>
            <input
              id="privacy-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={6}
              value={pinInput}
              onChange={(event) => {
                setErr("");
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
                  setConfirmPin(onlySixDigits(event.target.value));
                }}
                className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[18px] font-bold tracking-[.28em] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
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
