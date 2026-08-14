import { LogEntry } from "../../../foundation/logging/LogEntry.js";
import { LogWriter } from "../../../foundation/logging/Logger.js";
import { LogEnricher } from "../enrichers/LogEnricher.js";
import { JsonFormatter } from "../formatters/JsonFormatter.js";
import { FileSink } from "../sinks/FileSink.js";

/**
 * LogWriter assembling FileSink and JsonFormatter to save structured JSON logs.
 */
export class FileLogWriter {
  private readonly sink: FileSink;

  constructor(logFilePath: string) {
    this.sink = new FileSink(logFilePath);
  }

  /**
   * Enriches, formats, and appends the log entry to the log file.
   */
  public write(entry: LogEntry): void {
    const enriched = LogEnricher.enrich(entry);
    const message = JsonFormatter.format(enriched);
    this.sink.write(message);
  }

  /**
   * Exposes a standard LogWriter callback function.
   */
  public get writer(): LogWriter {
    return (entry) => this.write(entry);
  }
}
