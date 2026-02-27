"use client";

import { ModeSelector } from "./ModeSelector";
import { SessionConfig } from "./SessionConfig";
import { getQuizStats, getRecentHistory } from "@/utils/quizStorage";
import type { QuizGameMode, QuizSessionConfig } from "@/types/quiz";

interface QuizDashboardProps {
  config: QuizSessionConfig;
  onChangeConfig: (updates: Partial<QuizSessionConfig>) => void;
  onStart: () => void;
  availableQuestions: number;
}

export function QuizDashboard({
  config,
  onChangeConfig,
  onStart,
  availableQuestions,
}: QuizDashboardProps) {
  const stats = getQuizStats();
  const recentHistory = getRecentHistory(3);

  const handleModeChange = (mode: QuizGameMode) => {
    onChangeConfig({ mode });
  };

  const handleQuestionCountChange = (count: number | "all") => {
    onChangeConfig({ questionCount: count });
  };

  const handleTimeChange = (seconds: number) => {
    onChangeConfig({ timePerQuestion: seconds });
  };

  const canStart = availableQuestions > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {stats.lastScore !== null ? `${stats.lastScore}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Last Score</div>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {stats.bestScore > 0 ? `${stats.bestScore}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Best Score</div>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {stats.dailyStreak > 0 ? `${stats.dailyStreak}d` : "—"}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Daily Streak</div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6">
        <ModeSelector
          selectedMode={config.mode}
          onSelectMode={handleModeChange}
        />
      </div>

      {/* Session config */}
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6">
        <SessionConfig
          mode={config.mode}
          questionCount={config.questionCount}
          timePerQuestion={config.timePerQuestion ?? 30}
          onChangeQuestionCount={handleQuestionCountChange}
          onChangeTimePerQuestion={handleTimeChange}
          availableQuestions={availableQuestions}
        />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className="w-full rounded-xl bg-[var(--ifr-accent)] py-4 text-lg font-semibold text-white transition-all hover:bg-[var(--ifr-accent)]/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600"
      >
        {canStart ? "Start Quiz" : "No Questions Available"}
      </button>

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <h4 className="mb-3 text-sm font-medium text-[var(--ifr-text-muted)]">
            Recent Sessions
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentHistory.map((session, index) => (
              <div
                key={index}
                className="rounded-full bg-[var(--ifr-surface-muted)] px-3 py-1 text-sm"
              >
                <span className="capitalize text-[var(--ifr-text-muted)]">
                  {session.mode}
                </span>
                {" "}
                <span className="font-medium text-[var(--ifr-text)]">
                  {session.correct}/{session.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
