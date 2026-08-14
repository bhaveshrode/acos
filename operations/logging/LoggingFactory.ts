import { LogEntry } from "./LogEntry.js";
import { LogAggregator } from "./LogAggregator.js";
import { LokiLogExporter } from "./LokiLogExporter.js";

/**
 * LoggingFactory building log entities and aggregators.
 */
export class LoggingFactory {
  public static createEntry(
    level: string,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return new LogEntry(level, message, Date.now(), metadata);
  }

  public static createAggregator(): LogAggregator {
    return new LogAggregator();
  }

  public static createLokiExporter(): LokiLogExporter {
    return new LokiLogExporter();
  }

  public createEntry(
    level: string,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return LoggingFactory.createEntry(level, message, metadata);
  }

  public createAggregator(): LogAggregator {
    return LoggingFactory.createAggregator();
  }

  public createLokiExporter(): LokiLogExporter {
    return LoggingFactory.createLokiExporter();
  }
}
