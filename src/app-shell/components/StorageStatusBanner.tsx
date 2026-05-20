"use client";

import { useEffect, useState } from "react";

const STORAGE_ERROR_EVENT = "ifr-storage-error";

export function StorageStatusBanner() {
  const [hasStorageIssue, setHasStorageIssue] = useState(false);

  useEffect(() => {
    const markDegraded = () => setHasStorageIssue(true);
    window.addEventListener(STORAGE_ERROR_EVENT, markDegraded);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, markDegraded);
  }, []);

  if (!hasStorageIssue) return null;

  return (
    <div
      role="status"
      className="border-b border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning)]/10 px-4 py-2 text-sm text-[var(--ifr-warning)]"
    >
      Progress may not save on this device. Study content still works offline, but check browser storage permissions.
    </div>
  );
}
