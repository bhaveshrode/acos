import { LogEntry } from "../../../foundation/logging/LogEntry.js";

/**
 * Log formatter converting structured LogEntry instances into serialized JSON output.
 */
export class JsonFormatter {
  /**
   * Formats a LogEntry to a JSON string.
   */
  public static format(entry: LogEntry): string {
    const payload = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      moduleName: entry.context.moduleName,
      correlationId: entry.context.correlationId,
      causationId: entry.context.causationId,
      traceId: entry.context.traceId,
      spanId: entry.context.spanId,
      userId: entry.context.userId,
      additionalData: entry.context.additionalData,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack
          }
        : undefined
    };
    return JSON.stringify(payload);
  }
}
