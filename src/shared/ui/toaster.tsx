"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/**
 * App-wide Sonner toaster. Mount once at the root of the layout. Defaults
 * tuned for mobile: bottom position, swipe-to-dismiss, neutral styling
 * mapped to the IFR brand tokens.
 *
 * Use `import { toast } from "sonner"` (or re-exported via this module) to
 * fire toasts from anywhere in the app.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--ifr-surface)] group-[.toaster]:text-[var(--ifr-text)] group-[.toaster]:border-[var(--ifr-border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--ifr-text-muted)]",
          actionButton:
            "group-[.toast]:bg-[var(--ifr-cta-bg)] group-[.toast]:text-[var(--ifr-cta-fg)]",
          cancelButton:
            "group-[.toast]:bg-[var(--ifr-surface-muted)] group-[.toast]:text-[var(--ifr-text-muted)]",
        },
      }}
    />
  );
}

export { toast };
