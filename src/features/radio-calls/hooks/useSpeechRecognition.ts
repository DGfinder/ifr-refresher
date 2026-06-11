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
  /** Auto-stop after this many ms of silence once speech has been detected. */
  silenceTimeoutMs?: number;
  /** Failsafe if the recogniser opens but never hears/transcribes anything. */
  initialListenTimeoutMs?: number;
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
  silenceTimeoutMs = 3500,
  initialListenTimeoutMs = 10000,
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
  const initialListenTimerRef = useRef<number | null>(null);
  const finalAccumulatorRef = useRef<string>("");
  const latestTranscriptRef = useRef<string>("");

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearInitialListenTimer = useCallback(() => {
    if (initialListenTimerRef.current !== null) {
      window.clearTimeout(initialListenTimerRef.current);
      initialListenTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearSilenceTimer();
    clearInitialListenTimer();
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // Already stopped or never started — ignore.
    }
  }, [clearInitialListenTimer, clearSilenceTimer]);

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      stop();
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs, stop]);

  const armInitialListenTimer = useCallback(() => {
    clearInitialListenTimer();
    initialListenTimerRef.current = window.setTimeout(() => {
      stop();
    }, initialListenTimeoutMs);
  }, [clearInitialListenTimer, initialListenTimeoutMs, stop]);

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
    latestTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);

    rec.onresult = (event) => {
      clearInitialListenTimer();
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
      latestTranscriptRef.current = (
        finalAccumulatorRef.current +
        " " +
        interim
      ).trim();
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
      clearInitialListenTimer();
      setIsListening(false);
      // Some browser/Web Speech implementations end a short utterance with
      // only interim text. Preserve that as the committed transcript so the
      // drill can still assess what was heard instead of silently submitting
      // an empty call.
      if (!finalAccumulatorRef.current && latestTranscriptRef.current) {
        finalAccumulatorRef.current = latestTranscriptRef.current;
        setFinalTranscript(latestTranscriptRef.current);
      }
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
      armInitialListenTimer();
    } catch {
      setError("unknown");
    }
  }, [
    isSupported,
    isListening,
    lang,
    armInitialListenTimer,
    armSilenceTimer,
    clearInitialListenTimer,
    clearSilenceTimer,
  ]);

  const reset = useCallback(() => {
    finalAccumulatorRef.current = "";
    latestTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Always cancel on unmount so audio capture doesn't keep running after
  // the screen has gone away.
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      clearInitialListenTimer();
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [clearInitialListenTimer, clearSilenceTimer]);

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
