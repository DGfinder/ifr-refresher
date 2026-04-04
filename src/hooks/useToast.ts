import { useState, useCallback } from "react";
import type { ToastItem, ToastVariant } from "@/components/ui/Toast";

let idCounter = 0;
function nextId() {
  return `toast-${++idCounter}`;
}

export interface ShowToastOptions {
  message: string;
  detail?: string;
  variant?: ToastVariant;
  durationMs?: number;
  icon?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((opts: ShowToastOptions) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, ...opts }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
