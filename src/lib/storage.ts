import { del, get, set } from "idb-keyval";

const STORAGE_ERROR_EVENT = "ifr-storage-error";

function notifyStorageError(error: unknown): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: error }));
}

async function safeGet<T>(key: string): Promise<T | undefined> {
  try {
    return await get<T>(key);
  } catch (error) {
    notifyStorageError(error);
    throw error;
  }
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
  } catch (error) {
    notifyStorageError(error);
    throw error;
  }
}

async function safeDel(key: string): Promise<void> {
  try {
    await del(key);
  } catch (error) {
    notifyStorageError(error);
    throw error;
  }
}

export const storage = {
  get: safeGet,
  set: safeSet,
  del: safeDel,
};
