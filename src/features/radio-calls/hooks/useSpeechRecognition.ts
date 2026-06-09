"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Web Speech API isn't in standard lib.dom yet — declare just enough for
// our usage. The vendor-prefixed name is the only path on Safari and older
// Chromium.
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEvent extends Event {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    length: number;
    [index: number]: { transcript: string };
  }>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

interface RecognitionWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as RecognitionWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

function detectSupport(): boolean {
  return getCtor() !== null;
}

function detectSupportServer(): boolean {
  return false;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  /** Auto-stop after this many ms of silence. Default 1500ms. */
  silenceTimeoutMs?: number;
}

export type SpeechRecognitionError =
  | "not-allowed"
  | "no-speech"
  | "network"
  | "audio-capture"
  | "service-not-allowed"
  | "aborted"
  | "unknown";

interface UseSpeechRecognitionReturn {
  /** True when the browser exposes SpeechRecognition. False → hide the mic. */
  isSupported: boolean;
  isListening: boolean;
  /** Live partial transcript while listening. */
  interimTranscript: string;
  /** The committed transcript after the recogniser settles. */
  finalTranscript: string;
  /** Last error from the recogniser, or null. UI uses this to fall back
   *  silently to the text input. */
  error: SpeechRecognitionError | null;
  start: () => void;
  stop: () => void;
  /** Clear the captured transcript (e.g. when the learner moves to the next
   *  leg). */
  reset: () => void;
}

/**
 * Wrapper around `window.SpeechRecognition`. Exposes a finite-state slice
 * (idle → listening → stopped) plus interim/final transcript so the UI can
 * show what the learner is saying as they speak. Errors are reported but
 * never thrown — the caller falls back to text input.
 */
export function useSpeechRecognition({
  lang = "en-AU",
  silenceTimeoutMs = 1500,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    detectSupport,
    detectSupportServer,
  );

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<SpeechRecognitionError | null>(null);

  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalAccumulatorRef = useRef<string>("");

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearSilenceTimer();
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // Already stopped or never started — ignore.
    }
  }, [clearSilenceTimer]);

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      stop();
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs, stop]);

  const start = useCallback(() => {
    if (!isSupported || isListening) return;
    const Ctor = getCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    finalAccumulatorRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalAccumulatorRef.current = (
            finalAccumulatorRef.current +
            " " +
            transcript
          ).trim();
          setFinalTranscript(finalAccumulatorRef.current);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
      armSilenceTimer();
    };

    rec.onerror = (event) => {
      const known: SpeechRecognitionError[] = [
        "not-allowed",
        "no-speech",
        "network",
        "audio-capture",
        "service-not-allowed",
        "aborted",
      ];
      setError(known.includes(event.error as SpeechRecognitionError)
        ? (event.error as SpeechRecognitionError)
        : "unknown");
    };

    rec.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
      armSilenceTimer();
    } catch {
      setError("unknown");
    }
  }, [isSupported, isListening, lang, armSilenceTimer, clearSilenceTimer]);

  const reset = useCallback(() => {
    finalAccumulatorRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Always cancel on unmount so audio capture doesn't keep running after
  // the screen has gone away.
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    error,
    start,
    stop,
    reset,
  };
}
