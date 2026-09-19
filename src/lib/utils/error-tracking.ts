/**
 * Error Tracking Service — Sentry-ready wrapper
 *
 * Provides a unified interface for error tracking that works with or without Sentry.
 * When NEXT_PUBLIC_SENTRY_DSN is configured, errors are sent to Sentry.
 * Otherwise, falls back to structured console logging.
 */

export type ErrorContext = {
  userId?: string;
  email?: string;
  action?: string;
  component?: string;
  extra?: Record<string, unknown>;
};

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

interface SentryScope {
  setUser: (user: { id?: string; email?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setExtras: (extra: Record<string, unknown>) => void;
  setLevel: (level: ErrorSeverity) => void;
}

interface SentryInstance {
  withScope: (callback: (scope: SentryScope) => void) => void;
  captureException: (error: Error) => void;
  captureMessage: (message: string, level: ErrorSeverity) => void;
  setUser: (user: { id: string; email?: string; name?: string } | null) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
}

interface WindowWithSentry {
  __SENTRY__?: SentryInstance;
}

function getSentry(): SentryInstance | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as WindowWithSentry).__SENTRY__;
}

/**
 * Capture and report an error
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext,
  severity: ErrorSeverity = "error"
): void {
  const err = typeof error === "string" ? new Error(error) : error;

  // Sentry integration (when configured)
  const sentry = getSentry();
  if (sentry) {
    try {
      sentry.withScope((scope: SentryScope) => {
        if (context?.userId) scope.setUser({ id: context.userId, email: context.email });
        if (context?.action) scope.setTag("action", context.action);
        if (context?.component) scope.setTag("component", context.component);
        if (context?.extra) scope.setExtras(context.extra);
        scope.setLevel(severity);
        sentry.captureException(err);
      });
      return;
    } catch {
      // Fall through to console
    }
  }

  // Structured console logging fallback
  const logData = {
    timestamp: new Date().toISOString(),
    severity,
    message: err.message,
    stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    ...context,
  };

  switch (severity) {
    case "fatal":
    case "error":
      console.error("[PitchMint Error]", JSON.stringify(logData, null, 2));
      break;
    case "warning":
      console.warn("[PitchMint Warning]", JSON.stringify(logData, null, 2));
      break;
    case "info":
      console.info("[PitchMint Info]", JSON.stringify(logData, null, 2));
      break;
  }
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = "info"
): void {
  const sentry = getSentry();
  if (sentry) {
    try {
      sentry.captureMessage(message, severity);
      return;
    } catch {
      // Fall through
    }
  }

  console.log(`[PitchMint ${severity}]`, message, context || "");
}

/**
 * Set user context for all future error reports
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
}): void {
  const sentry = getSentry();
  if (sentry) {
    try {
      sentry.setUser(user);
    } catch {
      // Ignore
    }
  }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context?: Omit<ErrorContext, "extra">
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        ...context,
        extra: { args: args.length > 0 ? (args as unknown as Record<string, unknown>) : undefined },
      });
      throw error;
    }
  };
}

/**
 * Create a breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  const sentry = getSentry();
  if (sentry) {
    try {
      sentry.addBreadcrumb({
        category,
        message,
        data,
        level: "info",
        timestamp: Date.now() / 1000,
      });
    } catch {
      // Ignore
    }
  }
}
