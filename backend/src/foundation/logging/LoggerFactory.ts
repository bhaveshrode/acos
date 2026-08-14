import { Logger, LogWriter } from "./Logger.js";
import { LogContext } from "./LogContext.js";

/**
 * Factory class responsible for configuring log destinations and creating structured loggers.
 */
export class LoggerFactory {
  private static globalWriter: LogWriter = () => {};
  private static globalContext: LogContext = LogContext.empty();

  /**
   * Configures the global writing destination callback and base context properties.
   * @param writer Callback that processes each structured LogEntry.
   * @param baseContext Core context properties that should exist on all logs.
   */
  public static configure(
    writer: LogWriter,
    baseContext: LogContext = LogContext.empty()
  ): void {
    if (!writer) {
      throw new Error("LoggerFactory configure must be provided with a valid writer.");
    }
    LoggerFactory.globalWriter = writer;
    LoggerFactory.globalContext = baseContext;
  }

  /**
   * Creates a structured Logger for the specified category/module.
   * @param category Name of the module or component generating logs (e.g. 'Identity', 'Invoice').
   */
  public static create(category: string): Logger {
    return new Logger(
      category,
      (entry) => LoggerFactory.globalWriter(entry),
      LoggerFactory.globalContext
    );
  }

  /**
   * Resets the factory configurations back to silent defaults.
   */
  public static reset(): void {
    LoggerFactory.globalWriter = () => {};
    LoggerFactory.globalContext = LogContext.empty();
  }
}
