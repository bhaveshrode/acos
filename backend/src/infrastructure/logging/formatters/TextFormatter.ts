import { LogEntry } from "../../../foundation/logging/LogEntry.js";

/**
 * Log formatter converting structured LogEntry instances into standard plain-text strings.
 */
export class TextFormatter {
  /**
   * Formats a LogEntry to a human-readable text string.
   */
  public static format(entry: LogEntry): string {
    const time = entry.timestamp.toISOString();
    const level = entry.level.padEnd(8);
    const category = entry.context.moduleName ? `[${entry.context.moduleName}]` : "";
    let formatted = `[${time}] ${level} ${category} ${entry.message}`;

    const details: string[] = [];
    if (entry.context.correlationId) details.push(`correlationId=${entry.context.correlationId}`);
    if (entry.context.traceId) details.push(`traceId=${entry.context.traceId}`);
    if (entry.context.userId) details.push(`userId=${entry.context.userId}`);
    if (entry.context.additionalData && Object.keys(entry.context.additionalData).length > 0) {
      details.push(JSON.stringify(entry.context.additionalData));
    }

    if (details.length > 0) {
      formatted += ` | Context: ${details.join(" ")}`;
    }

    if (entry.error) {
      formatted += `\nError: ${entry.error.stack || entry.error.message}`;
    }

    return formatted;
  }
}
