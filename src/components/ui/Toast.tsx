"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning" | "milestone";

export interface ToastItem {
  id: string;
  message: string;
  detail?: string;
  variant?: ToastVariant;
  durationMs?: number;
  icon?: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger enter animation on next tick
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const duration = toast.durationMs ?? 3500;

    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variantStyles: Record<ToastVariant, string> = {
    success: "border-[var(--ifr-success)]/40 bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]",
    error:   "border-[var(--ifr-danger)]/40 bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)]",
    warning: "border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning)]/10 text-[var(--ifr-warning)]",
    info:    "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text)]",
    milestone: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };

  const variant = toast.variant ?? "info";

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        "transition-all duration-300",
        variantStyles[variant],
        visible && !exiting ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      )}
    >
      {toast.icon && (
        <span className="shrink-0 text-lg leading-none mt-0.5">{toast.icon}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{toast.message}</p>
        {toast.detail && (
          <p className="mt-0.5 text-xs opacity-75">{toast.detail}</p>
        )}
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
