import { ILogger } from "../contracts/system/ILogger.js";
import { LogLevel } from "./LogLevel.js";
import { LogContext } from "./LogContext.js";
import { LogEntry } from "./LogEntry.js";

export type LogWriter = (entry: LogEntry) => void;

/**
 * Standard implementation of ILogger contract.
 * Decoupled from transport outputs (e.g., console/Pino) via an injectable LogWriter callback.
 */
export class Logger implements ILogger {
  private readonly currentContext: LogContext;

  constructor(
    private readonly categoryName: string,
    private readonly writer: LogWriter,
    initialContext: LogContext = LogContext.empty()
  ) {
    if (!categoryName || categoryName.trim() === "") {
      throw new Error("Logger category name cannot be null or empty.");
    }
    if (!writer) {
      throw new Error("Logger write destination callback must be provided.");
    }
    this.currentContext = initialContext.merge({ moduleName: categoryName.trim() });
  }

  /**
   * Returns a new child Logger sharing the same writer but carrying merged contextual fields.
   * @param context Context properties dictionary or LogContext instance to merge.
   */
  public withContext(context: Record<string, any> | LogContext): Logger {
    const merged = this.currentContext.merge(context);
    return new Logger(this.categoryName, this.writer, merged);
  }

  /**
   * Maps arguments into an immutable LogEntry object and dispatches to the destination writer.
   */
  private write(
    level: LogLevel,
    message: string,
    contextObj?: Record<string, any>,
    error?: Error
  ): void {
    const logContext = contextObj
      ? this.currentContext.merge({ additionalData: contextObj })
      : this.currentContext;

    const entry = new LogEntry({
      level,
      message,
      context: logContext,
      error
    });

    this.writer(entry);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.write(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.write(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.write(LogLevel.ERROR, message, context, error);
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.write(LogLevel.DEBUG, message, context);
  }

  public trace(message: string, context?: Record<string, any>): void {
    this.write(LogLevel.TRACE, message, context);
  }

  /**
   * Logs a critical system-wide operational failure.
   */
  public critical(message: string, error?: Error, context?: Record<string, any>): void {
    this.write(LogLevel.CRITICAL, message, context, error);
  }
}
