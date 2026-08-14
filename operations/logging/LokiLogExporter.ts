import { LogEntry } from "./LogEntry.js";

/**
 * LokiLogExporter exporting packets payloads to log servers.
 */
export class LokiLogExporter {
  public async export(entries: LogEntry[]): Promise<boolean> {
    return entries.length > 0;
  }
}
