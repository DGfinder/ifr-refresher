"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic React error boundary. Wrap page sections that may fail
 * (e.g. localStorage/IDB reads) to show a graceful fallback instead of
 * crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd forward to Sentry / LogRocket here.
    console.error("[IFR ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-lg font-semibold text-[var(--ifr-text)]">Something went wrong</h2>
          <p className="max-w-sm text-sm text-[var(--ifr-text-muted)]">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-[var(--ifr-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
