import type { QuizQuestion, QuizOptionId } from "./drill";

// Quiz game modes
export type QuizGameMode = "classic" | "timed" | "learn" | "challenge";

// Quiz session phases
export type QuizPhase = "dashboard" | "session" | "results";

// Answer record for a single question
export interface QuizAnswer {
  questionId: string;
  selectedOptionId: QuizOptionId | null;
  correctOptionId: QuizOptionId;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  skipped: boolean;
  flagged: boolean;
}

// Session configuration
export interface QuizSessionConfig {
  mode: QuizGameMode;
  questionCount: number | "all";
  timePerQuestion?: number; // seconds, for timed mode
  totalTime?: number; // seconds, alternative to per-question
}

// Full session state
export interface QuizSessionState {
  phase: QuizPhase;
  config: QuizSessionConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOptionId: QuizOptionId | null;
  answers: QuizAnswer[];
  score: number;
  streak: number;
  maxStreak: number;
  lives: number; // Challenge mode (starts at 3)
  timeRemaining: number; // seconds
  questionStartTime: number; // timestamp
  isPaused: boolean;
  flaggedQuestions: Set<string>;
}

// Result of a completed quiz session
export interface QuizResult {
  id: string; // unique session id
  mode: QuizGameMode;
  completedAt: string; // ISO timestamp
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  score: number;
  maxStreak: number;
  timeSpent: number; // total milliseconds
  answers: QuizAnswer[];
  bySection: Record<string, { correct: number; total: number }>;
}

// Daily streak tracking
export interface DailyStreak {
  current: number;
  lastDate: string; // YYYY-MM-DD
  longest: number;
}

// Aggregate stats
export interface QuizTotalStats {
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalTimeSpent: number; // milliseconds
}

// Best scores per mode
export type QuizBestScores = Record<QuizGameMode, number>;

// Full localStorage schema
export interface QuizProgress {
  history: QuizResult[]; // Last 50 sessions
  bestScores: QuizBestScores;
  totalStats: QuizTotalStats;
  dailyStreak: DailyStreak;
  masteredQuestions: string[]; // IDs answered 3+ times correctly
}

// Score thresholds for feedback
export const SCORE_THRESHOLDS = {
  excellent: 90,
  great: 80,
  good: 70,
  needsWork: 0,
} as const;

// Streak multiplier thresholds
export const STREAK_MULTIPLIERS = {
  0: 1,
  3: 2,
  5: 3,
  10: 4,
} as const;

// Points system
export const POINTS = {
  base: 100,
  timeBonus: {
    fast: 50, // < 5 seconds
    medium: 25, // < 10 seconds
    slow: 10, // < 20 seconds
  },
  challengeMultiplier: 2,
} as const;

// Default session config
export const DEFAULT_SESSION_CONFIG: QuizSessionConfig = {
  mode: "classic",
  questionCount: 10,
};

// Initial session state factory
export function createInitialSessionState(): QuizSessionState {
  return {
    phase: "dashboard",
    config: { ...DEFAULT_SESSION_CONFIG },
    questions: [],
    currentIndex: 0,
    selectedOptionId: null,
    answers: [],
    score: 0,
    streak: 0,
    maxStreak: 0,
    lives: 3,
    timeRemaining: 0,
    questionStartTime: 0,
    isPaused: false,
    flaggedQuestions: new Set(),
  };
}

// Default progress state
export function createInitialProgress(): QuizProgress {
  return {
    history: [],
    bestScores: {
      classic: 0,
      timed: 0,
      learn: 0,
      challenge: 0,
    },
    totalStats: {
      quizzesCompleted: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
    },
    dailyStreak: {
      current: 0,
      lastDate: "",
      longest: 0,
    },
    masteredQuestions: [],
  };
}
