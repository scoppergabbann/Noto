"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Focus dialog hanya sekali saat modal baru dibuka,
    // bukan setiap render / setiap parent state berubah.
    if (!wasOpenRef.current) {
      wasOpenRef.current = true;

      window.setTimeout(() => {
        const active = document.activeElement;

        // Jangan rebut focus kalau user sudah fokus ke input/select/textarea/button.
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active instanceof HTMLSelectElement ||
          active instanceof HTMLButtonElement
        ) {
          return;
        }

        dialogRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sizeClass = {
    sm: "sm:max-w-[420px]",
    md: "sm:max-w-[480px]",
    lg: "sm:max-w-[620px]",
  }[size];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={[
          "relative z-[101] w-full",
          "max-h-[92dvh] overflow-y-auto overscroll-contain",
          "rounded-[22px] border border-black/[.08] bg-white px-5 pb-6 pt-5 shadow-softlg",
          "dark:border-white/10 dark:bg-[#16171c]",
          `sm:max-h-[90vh] ${sizeClass}`,
          "sm:p-6",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        ].join(" ")}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10 dark:bg-white/15 sm:hidden" />

        <div className="mb-5 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[19px]">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className={[
              "ml-auto grid shrink-0 place-items-center rounded-xl",
              "h-11 w-11 text-ink-dim",
              "transition hover:bg-black/[.05] active:bg-black/10",
              "dark:hover:bg-white/10 dark:active:bg-white/15",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
            ].join(" ")}
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>

        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
