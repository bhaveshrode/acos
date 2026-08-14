import { LogEntry } from "../../../foundation/logging/LogEntry.js";
import { LogWriter } from "../../../foundation/logging/Logger.js";
import { LogEnricher } from "../enrichers/LogEnricher.js";
import { TextFormatter } from "../formatters/TextFormatter.js";
import { ConsoleSink } from "../sinks/ConsoleSink.js";

/**
 * LogWriter assembling ConsoleSink and TextFormatter to print human-readable traces.
 */
export class ConsoleLogWriter {
  private readonly sink = new ConsoleSink();

  /**
   * Enriches, formats, and writes the log entry to the console.
   */
  public write(entry: LogEntry): void {
    const enriched = LogEnricher.enrich(entry);
    const message = TextFormatter.format(enriched);
    this.sink.write(message, enriched.level);
  }

  /**
   * Exposes a standard LogWriter callback function.
   */
  public get writer(): LogWriter {
    return (entry) => this.write(entry);
  }
}
