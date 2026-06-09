"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

interface SpeakOptions {
  pitch?: number;
  rate?: number;
}

interface UseRadioAudioReturn {
  /** Whether the browser exposes the SpeechSynthesis API at all. False on a
   * handful of older browsers and some headless contexts; callers should hide
   * the audio button when this is false. */
  isSupported: boolean;
  /** True between utterance start and end / error / cancel. */
  isSpeaking: boolean;
  /** The id of the line that is currently speaking, or null. Used to
   * highlight which transmission card is playing. */
  speakingId: string | null;
  speak: (id: string, text: string, opts?: SpeakOptions) => void;
  stop: () => void;
}

// useSyncExternalStore wants a stable subscribe function and identity-stable
// snapshots. SpeechSynthesis availability never changes within a session, so
// the subscribe is a no-op and the snapshot is computed once per call.
const noopSubscribe = () => () => {};

function detectSupport(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

function detectSupportServer(): boolean {
  return false;
}

export function useRadioAudio(): UseRadioAudioReturn {
  const isSupported = useSyncExternalStore(noopSubscribe, detectSupport, detectSupportServer);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const cancelTokenRef = useRef(0);

  // On unmount, abort any in-flight utterance so audio doesn't keep playing
  // after the user navigates away.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (id: string, text: string, opts: SpeakOptions = {}) => {
      if (!isSupported || typeof window === "undefined") return;

      // Cancel any in-flight utterance so the new line takes over cleanly.
      window.speechSynthesis.cancel();
      cancelTokenRef.current += 1;
      const token = cancelTokenRef.current;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = opts.rate ?? 0.95;
      utterance.pitch = opts.pitch ?? 1.0;

      utterance.onstart = () => {
        if (cancelTokenRef.current !== token) return;
        setIsSpeaking(true);
        setSpeakingId(id);
      };
      const finish = () => {
        if (cancelTokenRef.current !== token) return;
        setIsSpeaking(false);
        setSpeakingId(null);
      };
      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    if (!isSupported || typeof window === "undefined") return;
    cancelTokenRef.current += 1;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingId(null);
  }, [isSupported]);

  return { isSupported, isSpeaking, speakingId, speak, stop };
}
