"use client";

import { useState, useEffect } from "react";
import { ModeSelector } from "./ModeSelector";
import { SessionConfig } from "./SessionConfig";
import { getQuizStats, getRecentHistory } from "@/utils/quizStorage";
import { QuizStatsSkeleton } from "@/components/ui/Skeleton";
import { QuizHistoryEmptyState } from "@/components/ui/EmptyState";
import type { QuizGameMode, QuizSessionConfig } from "@/types/quiz";

interface QuizDashboardProps {
  config: QuizSessionConfig;
  onChangeConfig: (updates: Partial<QuizSessionConfig>) => void;
  onStart: () => void;
  availableQuestions: number;
}

type StatsType = Awaited<ReturnType<typeof getQuizStats>>;
type HistoryType = Awaited<ReturnType<typeof getRecentHistory>>;

const DEFAULT_STATS: StatsType = {
  lastScore: null,
  bestScore: 0,
  dailyStreak: 0,
  totalQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  averageScore: 0,
};

export function QuizDashboard({
  config,
  onChangeConfig,
  onStart,
  availableQuestions,
}: QuizDashboardProps) {
  const [stats, setStats] = useState<StatsType>(DEFAULT_STATS);
  const [recentHistory, setRecentHistory] = useState<HistoryType>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getQuizStats(), getRecentHistory(3)]).then(([s, h]) => {
      setStats(s);
      setRecentHistory(h);
      setLoading(false);
    });
  }, []);

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
  const hasHistory = !loading && stats.totalQuizzes > 0;
  const isFirstTime = !loading && stats.totalQuizzes === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* First-run encouraging banner */}
      {isFirstTime && (
        <div className="rounded-xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 px-5 py-4">
          <p className="text-sm font-semibold text-[var(--ifr-text)]">
            ✈️ Ready to check your IFR knowledge?
          </p>
          <p className="mt-1 text-xs text-[var(--ifr-text-muted)]">
            Pick a mode below and hit Quiz Me — your progress is saved offline.
          </p>
        </div>
      )}

      {/* Stats row — skeleton while loading */}
      {loading ? (
        <QuizStatsSkeleton />
      ) : (
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
            <div
              className="text-2xl font-bold"
              style={{
                color: stats.dailyStreak >= 7
                  ? "var(--ifr-warning)"
                  : stats.dailyStreak >= 3
                  ? "var(--ifr-success)"
                  : "var(--ifr-text)",
              }}
            >
              {stats.dailyStreak > 0 ? `${stats.dailyStreak}d` : "—"}
            </div>
            <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Daily Streak</div>
          </div>
        </div>
      )}

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
        className="w-full rounded-xl bg-[var(--ifr-accent)] py-4 text-lg font-semibold text-white transition-all hover:bg-[var(--ifr-accent)]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600"
      >
        {canStart
          ? `Quiz Me — ${availableQuestions} question${availableQuestions !== 1 ? "s" : ""} ready`
          : "No Questions Available"}
      </button>

      {/* Recent history or empty state */}
      {loading ? null : hasHistory ? (
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
                </span>{" "}
                <span className="font-medium text-[var(--ifr-text)]">
                  {session.correct}/{session.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <QuizHistoryEmptyState />
      )}
    </div>
  );
}
