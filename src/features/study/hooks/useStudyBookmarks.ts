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
  toggleBookmark: (sectionId: string, moduleId: string) => Promise<void>;
}

/**
 * "Save this for review" — a flag separate from completion. The student
 * uses this to mark "I read it but I need to revisit", which is distinct
 * from "Mark as Read" (completion).
 *
 * State is loaded once on mount. Toggling writes through to IDB and
 * updates local state in lockstep so the heart icon flips immediately.
 */
export function useStudyBookmarks(): UseStudyBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<StudyBookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const toggleBookmark = useCallback(
    async (sectionId: string, moduleId: string) => {
      const key = bookmarkKey(sectionId, moduleId);
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
      await saveStudyBookmarks(next);
    },
    [bookmarks],
  );

  return { bookmarks, isLoaded, isBookmarked, toggleBookmark };
}
