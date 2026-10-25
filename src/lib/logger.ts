/**
 * Enterprise Server-Side Logger with Automatic PII & Secrets Scrubbing
 * Provides structured logging and an extensible hook for Sentry / external APM.
 */

const SECRET_PATTERNS = [
  /shpat_[a-zA-Z0-9]{32}/gi,
  /rzp_(?:live|test)_[a-zA-Z0-9]+/gi,
  /bearer\s+[a-zA-Z0-9._-]+/gi,
  /"password":\s*"[^"]+"/gi,
  /"secret":\s*"[^"]+"/gi,
  /"token":\s*"[^"]+"/gi,
];

const PII_PATTERNS = [
  // Phone numbers (10-digit Indian mobile or +91 format)
  /(?:\+91[\s-]?)?[6-9]\d{9}/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

function sanitizeString(str: string): string {
  let cleaned = str;
  for (const pattern of SECRET_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_SECRET]");
  }
  for (const pattern of PII_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_PII]");
  }
  return cleaned;
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("authorization") ||
        lowerKey.includes("cookie") ||
        lowerKey.includes("credit") ||
        lowerKey.includes("card")
      ) {
        result[key] = "[REDACTED_SENSITIVE]";
      } else if (
        lowerKey.includes("email") ||
        lowerKey.includes("phone") ||
        lowerKey.includes("address")
      ) {
        result[key] = "[REDACTED_PII]";
      } else {
        result[key] = sanitizeObject(value);
      }
    }
    return result;
  }
  return obj;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEvent {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(
    level: LogLevel,
    context: string,
    message: string,
    data?: unknown,
    err?: unknown
  ): LogEvent {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: sanitizeString(message),
    };

    if (data !== undefined) {
      event.data = sanitizeObject(data);
    }

    if (err instanceof Error) {
      event.error = {
        name: err.name,
        message: sanitizeString(err.message),
        // In production, omit internal file traces unless debug mode is active
        stack:
          process.env.NODE_ENV === "development"
            ? sanitizeString(err.stack || "")
            : undefined,
      };
    } else if (err) {
      event.error = {
        name: "UnknownError",
        message: sanitizeString(String(err)),
      };
    }

    return event;
  }

  private dispatch(event: LogEvent) {
    const jsonStr = JSON.stringify(event);

    switch (event.level) {
      case "error":
        console.error(jsonStr);
        this.forwardToSentryHook(event);
        break;
      case "warn":
        console.warn(jsonStr);
        break;
      default:
        console.log(jsonStr);
    }
  }

  /**
   * Sentry-style error forwarding hook.
   * If SENTRY_DSN or a global monitoring client is configured, dispatches securely.
   */
  private forwardToSentryHook(event: LogEvent) {
    try {
      // Integration hook for Sentry / external error monitoring
      if (process.env.SENTRY_DSN && typeof globalThis !== "undefined") {
        const sentryGlobal = (globalThis as unknown as { Sentry?: { captureException: (err: unknown, ctx: unknown) => void } }).Sentry;
        if (sentryGlobal?.captureException) {
          sentryGlobal.captureException(new Error(event.message), {
            tags: { context: event.context, level: event.level },
            extra: { data: event.data },
          });
        }
      }
    } catch {
      // Fail closed to prevent logging failure from crashing request thread
    }
  }

  info(context: string, message: string, data?: unknown) {
    this.dispatch(this.formatLog("info", context, message, data));
  }

  warn(context: string, message: string, data?: unknown) {
    this.dispatch(this.formatLog("warn", context, message, data));
  }

  error(context: string, message: string, err?: unknown, data?: unknown) {
    this.dispatch(this.formatLog("error", context, message, data, err));
  }
}

export const logger = new Logger();
