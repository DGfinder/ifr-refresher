"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Mic, Square, X, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioSpokenCall } from "@/content/model/radio";
import { evaluateSpokenCall } from "@/features/radio-calls/model/spokenMatch";
import { useSpeechRecognition } from "@/features/radio-calls/hooks/useSpeechRecognition";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

interface SpokenCallChallengeProps {
  call: RadioSpokenCall;
  isSubmitted: boolean;
  /** The transcript that's been committed (either via mic stop or text edit). */
  transcript: string;
  /** Live updates while the learner edits the text field or speech recognition
   *  is producing partials. */
  onTranscriptChange: (transcript: string) => void;
  onSubmit: (transcript: string) => void;
}

export function SpokenCallChallenge({
  call,
  isSubmitted,
  transcript,
  onTranscriptChange,
  onSubmit,
}: SpokenCallChallengeProps) {
  const speech = useSpeechRecognition();
  const [textInput, setTextInput] = useState(transcript);

  // Mirror committed transcript ⇄ the editable text field.
  useEffect(() => {
    setTextInput(transcript);
  }, [transcript]);

  // When SR commits a final result, lift it up into the parent so the text
  // field shows what was heard and the parent can submit.
  useEffect(() => {
    if (!isSubmitted && speech.finalTranscript) {
      onTranscriptChange(speech.finalTranscript);
    }
  }, [speech.finalTranscript, isSubmitted, onTranscriptChange]);

  const liveDisplay = useMemo(() => {
    if (isSubmitted) return transcript;
    if (speech.isListening) {
      const live = (speech.finalTranscript + " " + speech.interimTranscript).trim();
      return live || "(listening…)";
    }
    return textInput;
  }, [
    isSubmitted,
    transcript,
    textInput,
    speech.isListening,
    speech.finalTranscript,
    speech.interimTranscript,
  ]);

  const evaluation = useMemo(
    () => (isSubmitted ? evaluateSpokenCall(call, transcript) : null),
    [isSubmitted, call, transcript],
  );

  const handleSubmit = () => {
    if (speech.isListening) speech.stop();
    const draftTranscript = (
      speech.finalTranscript ||
      speech.interimTranscript ||
      textInput
    ).trim();
    onTranscriptChange(draftTranscript);
    onSubmit(draftTranscript);
  };

  const showMic = speech.isSupported && !isSubmitted;

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--ifr-text-muted)]">
        Make the call
      </p>
      <p className="mb-4 text-base leading-relaxed text-[var(--ifr-text)]">
        {call.prompt}
      </p>

      {/* Mic button (when supported and pre-submit) */}
      {showMic && (
        <button
          type="button"
          onClick={() => (speech.isListening ? speech.stop() : speech.start())}
          aria-pressed={speech.isListening}
          aria-label={speech.isListening ? "Stop listening" : "Tap to speak the call"}
          className={cn(
            "mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
            speech.isListening
              ? "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)] animate-pulse motion-reduce:animate-none"
              : "border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 text-[var(--ifr-accent)] hover:bg-[var(--ifr-accent)]/10",
          )}
        >
          {speech.isListening ? <Square size={16} /> : <Mic size={16} />}
          <span>{speech.isListening ? "Listening — tap to stop" : "Tap to speak"}</span>
        </button>
      )}

      {/* Soft notice when SR errors out — encourages text input fallback. */}
      {speech.error && speech.error !== "no-speech" && speech.error !== "aborted" && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-[var(--ifr-warning)]/30 bg-[var(--ifr-warning)]/5 p-3 text-xs text-[var(--ifr-warning)]">
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Speech recognition unavailable
            {speech.error === "not-allowed" && " — microphone permission denied"}
            {speech.error === "network" && " — network required for transcription"}
            {speech.error === "audio-capture" && " — no microphone detected"}
            {". Type your call below instead."}
          </span>
        </div>
      )}

      {/* Always-visible text field — works as primary input when SR is
          unsupported / declined, and as an editor for the SR transcript. */}
      <label className="mb-3 block">
        <span className="sr-only">Type your radio call</span>
        <textarea
          value={isSubmitted ? transcript : liveDisplay}
          readOnly={isSubmitted || speech.isListening}
          onChange={(e) => setTextInput(e.target.value)}
          onBlur={() => {
            if (!speech.isListening && !isSubmitted) onTranscriptChange(textInput);
          }}
          placeholder="…or type the call here"
          rows={3}
          className={cn(
            "w-full rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-3 py-2 text-sm text-[var(--ifr-text)] placeholder:text-[var(--ifr-text-muted)]/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
            speech.isListening &&
              "border-[var(--ifr-accent)] italic text-[var(--ifr-text-muted)]",
            isSubmitted && "cursor-default",
          )}
        />
      </label>

      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={
            textInput.trim().length === 0 &&
            !speech.finalTranscript.trim() &&
            !speech.interimTranscript.trim()
          }
          size="lg"
          className="w-full"
        >
          Submit call
        </Button>
      )}

      {isSubmitted && evaluation && (
        <ElementReveal call={call} evaluation={evaluation} />
      )}
    </Card>
  );
}

interface ElementRevealProps {
  call: RadioSpokenCall;
  evaluation: ReturnType<typeof evaluateSpokenCall>;
}

function ElementReveal({ call, evaluation }: ElementRevealProps) {
  const hitSet = new Set(evaluation.hits.map((e) => e.label));
  const missedRequiredSet = new Set(evaluation.missedRequired.map((e) => e.label));

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-3 text-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
          AIP-standard
        </p>
        <p className="leading-relaxed text-[var(--ifr-text)]">{call.expectedText}</p>
      </div>

      <ul className="space-y-1.5" aria-label="Element breakdown">
        {call.elements.map((el) => {
          const status: "hit" | "missed-required" | "missed-optional" = hitSet.has(el.label)
            ? "hit"
            : missedRequiredSet.has(el.label)
              ? "missed-required"
              : "missed-optional";
          return (
            <li
              key={el.label}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                status === "hit" &&
                  "border-[var(--ifr-success)]/30 bg-[var(--ifr-success)]/5",
                status === "missed-required" &&
                  "border-[var(--ifr-danger)]/30 bg-[var(--ifr-danger)]/5",
                status === "missed-optional" &&
                  "border-[var(--ifr-warning)]/30 bg-[var(--ifr-warning)]/5",
              )}
            >
              {status === "hit" && (
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--ifr-success)]" aria-hidden="true" />
              )}
              {status === "missed-required" && (
                <X size={14} className="mt-0.5 shrink-0 text-[var(--ifr-danger)]" aria-hidden="true" />
              )}
              {status === "missed-optional" && (
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-[var(--ifr-warning)]" aria-hidden="true" />
              )}
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      status === "hit" && "text-[var(--ifr-success)]",
                      status === "missed-required" && "text-[var(--ifr-danger)]",
                      status === "missed-optional" && "text-[var(--ifr-warning)]",
                    )}
                  >
                    {el.label}
                  </span>
                  {!el.required && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
                      recommended
                    </span>
                  )}
                </div>
                {status !== "hit" && el.hint && (
                  <p className="mt-0.5 text-xs text-[var(--ifr-text-muted)]">{el.hint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--ifr-text-muted)]">
        {evaluation.isCorrect
          ? `All ${evaluation.hits.length} elements present.`
          : `${evaluation.hits.length} hit · ${evaluation.missedRequired.length} required missed${
              evaluation.missedOptional.length > 0
                ? ` · ${evaluation.missedOptional.length} recommended missed`
                : ""
            }`}
      </p>

      {call.explanation && (
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-3 text-sm text-[var(--ifr-text)]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            Why
          </p>
          <p className="leading-relaxed">{call.explanation}</p>
        </div>
      )}
    </div>
  );
}
