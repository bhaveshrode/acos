import { LogLevel } from "../../../foundation/logging/LogLevel.js";

/**
 * Diagnostic log sink target emitting output directly to console standard output or error streams.
 */
export class ConsoleSink {
  /**
   * Writes the formatted message to stdout or stderr depending on log severity level.
   */
  public write(formattedMessage: string, level: LogLevel): void {
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
}
