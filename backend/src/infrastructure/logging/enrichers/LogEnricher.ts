import { LogEntry } from "../../../foundation/logging/LogEntry.js";

/**
 * Log enricher appending environment configuration and process diagnostic metadata to logs.
 */
export class LogEnricher {
  /**
   * Enriches the log entry with process metadata.
   */
  public static enrich(entry: LogEntry): LogEntry {
    const processData = {
      pid: process.pid,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP__VERSION || "1.0.0"
    };

    const enrichedContext = entry.context.merge({
      additionalData: {
        ...processData,
        ...entry.context.additionalData
      }
    });

    return new LogEntry({
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      context: enrichedContext,
      error: entry.error
    });
  }
}
