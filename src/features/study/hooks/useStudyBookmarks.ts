"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bookmarkKey,
  getBookmarkKeySet,
  loadStudyBookmarks,
  saveStudyBookmarks,
  type StudyBookmark,
} from "@/features/study/storage/studyBookmarkStore";

interface UseStudyBookmarksReturn {
  bookmarks: StudyBookmark[];
  isLoaded: boolean;
  isBookmarked: (sectionId: string, moduleId: string) => boolean;
  /** True while an IDB write is in-flight. UI should disable the toggle
   * (and reflect a pending visual) so rapid double-taps don't race. */
  isPending: (sectionId: string, moduleId: string) => boolean;
  toggleBookmark: (sectionId: string, moduleId: string) => Promise<void>;
}

/**
 * "Save this for review" — a flag separate from completion. The student
 * uses this to mark "I read it but I need to revisit", which is distinct
 * from "Mark as Read" (completion).
 *
 * State is loaded once on mount. Toggle updates local state optimistically
 * and writes through to IDB; while the write is in-flight, the affected
 * key is reported via `isPending` so the UI can lock the toggle and avoid
 * double-fires on fast taps. Local state never rolls back on write error
 * — the optimistic update is what the user expects and the IDB write
 * failure is logged.
 */
export function useStudyBookmarks(): UseStudyBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<StudyBookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadStudyBookmarks();
      if (!cancelled) {
        setBookmarks(loaded);
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const keySet = useMemo(() => getBookmarkKeySet(bookmarks), [bookmarks]);

  const isBookmarked = useCallback(
    (sectionId: string, moduleId: string) =>
      keySet.has(bookmarkKey(sectionId, moduleId)),
    [keySet],
  );

  const isPending = useCallback(
    (sectionId: string, moduleId: string) =>
      pendingKeys.has(bookmarkKey(sectionId, moduleId)),
    [pendingKeys],
  );

  const toggleBookmark = useCallback(
    async (sectionId: string, moduleId: string) => {
      const key = bookmarkKey(sectionId, moduleId);
      // Guard against double-tap during in-flight write.
      if (pendingKeys.has(key)) return;
      const exists = bookmarks.some(
        (b) => bookmarkKey(b.sectionId, b.moduleId) === key,
      );
      const next = exists
        ? bookmarks.filter(
            (b) => bookmarkKey(b.sectionId, b.moduleId) !== key,
          )
        : [
            { sectionId, moduleId, savedAt: new Date().toISOString() },
            ...bookmarks,
          ];
      setBookmarks(next);
      setPendingKeys((prev) => {
        const out = new Set(prev);
        out.add(key);
        return out;
      });
      try {
        await saveStudyBookmarks(next);
      } finally {
        setPendingKeys((prev) => {
          const out = new Set(prev);
          out.delete(key);
          return out;
        });
      }
    },
    [bookmarks, pendingKeys],
  );

  return { bookmarks, isLoaded, isBookmarked, isPending, toggleBookmark };
}
