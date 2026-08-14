import { LogEntry } from "../../../foundation/logging/LogEntry.js";
import { LogWriter } from "../../../foundation/logging/Logger.js";

/**
 * LogWriter distributing log entry instances to multiple child writers.
 */
export class CompositeLogWriter {
  constructor(private readonly writers: LogWriter[]) {}

  /**
   * Distributes the log entry to all child writers. Fails silently if a child throws.
   */
  public write(entry: LogEntry): void {
    for (const writer of this.writers) {
      try {
        writer(entry);
      } catch {
        // Fail-safe boundary
      }
    }
  }

  /**
   * Exposes a standard LogWriter callback function.
   */
  public get writer(): LogWriter {
    return (entry) => this.write(entry);
  }
}
