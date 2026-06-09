# Home Feature

Owns the home/landing dashboard at `/`. Aggregates cheat-sheet progress and weak-question counts to give the user a single-screen status view and the primary entry points (Study / Flashcards / Quiz).

Reads progress via `@/features/progress` and drill stats via `@/features/drill`. Does not write to storage directly.
