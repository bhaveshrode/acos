import { LogLevel } from "../../../foundation/logging/LogLevel.js";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.TRACE]: 0,
  [LogLevel.DEBUG]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.WARN]: 3,
  [LogLevel.ERROR]: 4,
  [LogLevel.CRITICAL]: 5
};

/**
 * Filter evaluating log level severity levels against configured minimum thresholds.
 */
export class MinimumLevelFilter {
  constructor(private readonly minLevel: LogLevel) {}

  /**
   * Returns true if the severity level meets or exceeds the configured minimum level.
   */
  public shouldLog(level: LogLevel): boolean {
    const currentPriority = LEVEL_PRIORITY[level] ?? 0;
    const minPriority = LEVEL_PRIORITY[this.minLevel] ?? 2;
    return currentPriority >= minPriority;
  }
}
