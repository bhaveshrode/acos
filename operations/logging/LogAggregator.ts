import { LogEntry } from "./LogEntry.js";

/**
 * LogAggregator buffering logs for ingestion.
 */
export class LogAggregator {
  private readonly logs: LogEntry[] = [];

  public log(entry: LogEntry): void {
    this.logs.push(entry);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}
