import { LogEntry } from "../../../foundation/logging/LogEntry.js";
import { MinimumLevelFilter } from "../filters/MinimumLevelFilter.js";
import { LogWriter } from "../../../foundation/logging/Logger.js";

/**
 * Diagnostic log router evaluating filters before passing messages to sinks.
 */
export class LogRouter {
  constructor(
    private readonly filter: MinimumLevelFilter,
    private readonly writer: LogWriter
  ) {}

  /**
   * Evaluates minimum log levels and directs log entry to the active writer callback.
   */
  public route(entry: LogEntry): void {
    if (this.filter.shouldLog(entry.level)) {
      try {
        this.writer(entry);
      } catch {
        // Observability fail-safe boundary
      }
    }
  }
}
