import { storage } from "@/platform/storage/idbStorage";

const STORAGE_KEY = "ifrStudyBookmarks";

/**
 * Bumped if the bookmark entry shape changes incompatibly. Entries with a
 * non-matching tag are dropped on load.
 */
export const STUDY_BOOKMARKS_SCHEMA_TAG = "ifr-study-bookmarks@1";

/** Cap to keep storage bounded — 1000 saved modules is well past plausible. */
const MAX_BOOKMARKS = 1000;

export interface StudyBookmark {
  sectionId: string;
  moduleId: string;
  /** ISO timestamp of when this bookmark was added. */
  savedAt: string;
}

interface StudyBookmarkEnvelope {
  v: 1;
  schemaTag: string;
  bookmarks: StudyBookmark[];
}

function isEnvelope(value: unknown): value is StudyBookmarkEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 1 && typeof v.schemaTag === "string" && Array.isArray(v.bookmarks)
  );
}

function isBookmark(value: unknown): value is StudyBookmark {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sectionId === "string" &&
    typeof v.moduleId === "string" &&
    typeof v.savedAt === "string"
  );
}

export function migrateStudyBookmarks(raw: unknown): StudyBookmark[] {
  if (!isEnvelope(raw)) return [];
  if (raw.schemaTag !== STUDY_BOOKMARKS_SCHEMA_TAG) return [];
  return raw.bookmarks.filter(isBookmark).slice(0, MAX_BOOKMARKS);
}

function wrap(bookmarks: StudyBookmark[]): StudyBookmarkEnvelope {
  return {
    v: 1,
    schemaTag: STUDY_BOOKMARKS_SCHEMA_TAG,
    bookmarks: bookmarks.slice(0, MAX_BOOKMARKS),
  };
}

export async function loadStudyBookmarks(): Promise<StudyBookmark[]> {
  try {
    const raw = await storage.get<unknown>(STORAGE_KEY);
    return migrateStudyBookmarks(raw);
  } catch {
    return [];
  }
}

export async function saveStudyBookmarks(
  bookmarks: StudyBookmark[],
): Promise<void> {
  try {
    await storage.set(STORAGE_KEY, wrap(bookmarks));
  } catch (e) {
    console.error("Failed to save study bookmarks:", e);
  }
}

export function bookmarkKey(sectionId: string, moduleId: string): string {
  return `${sectionId}:${moduleId}`;
}

/**
 * Convenience: turn a list of bookmarks into a Set of "sectionId:moduleId"
 * keys for fast \`is-bookmarked?\` lookups in render.
 */
export function getBookmarkKeySet(bookmarks: readonly StudyBookmark[]): Set<string> {
  const out = new Set<string>();
  for (const b of bookmarks) out.add(bookmarkKey(b.sectionId, b.moduleId));
  return out;
}

/**
 * Most-recently-saved bookmarks first. Used by /insights to surface
 * recently-flagged-for-review modules at the top.
 */
export function getRecentBookmarks(
  bookmarks: readonly StudyBookmark[],
  limit: number,
): StudyBookmark[] {
  return [...bookmarks]
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    .slice(0, limit);
}
