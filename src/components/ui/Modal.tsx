"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      // Focus trap: focus dialog on open
      setTimeout(() => dialogRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Bottom sheet on mobile, centered on desktop */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={[
          // Mobile: slide up from bottom, full width, rounded top corners
          "fixed bottom-0 left-0 right-0 z-[101]",
          "max-h-[92dvh] overflow-y-auto overscroll-contain",
          "rounded-t-[24px] border-t border-black/[.06] bg-white px-5 pb-8 pt-5",
          "dark:border-white/10 dark:bg-[#16171c]",
          // Desktop: centered dialog
          "sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:m-auto",
          "sm:max-h-[90vh] sm:w-full sm:max-w-[480px]",
          "sm:rounded-[22px] sm:border sm:border-black/[.08] sm:p-6 sm:shadow-softlg",
          // Animate
          "animate-in slide-in-from-bottom-4 sm:animate-in sm:fade-in-0 sm:zoom-in-95 duration-200",
        ].join(" ")}
      >
        {/* Drag handle — mobile only */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10 dark:bg-white/15 sm:hidden" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[19px]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Tutup"
            className={[
              "ml-auto grid shrink-0 place-items-center rounded-xl",
              "h-11 w-11 text-ink-dim", // 44px touch target
              "transition hover:bg-black/[.05] active:bg-black/10",
              "dark:hover:bg-white/10 dark:active:bg-white/15",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
            ].join(" ")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>

      {/* Overlay click area for desktop */}
      <div className="hidden sm:fixed sm:inset-0 sm:grid sm:place-items-center" />
    </div>
  );
}
