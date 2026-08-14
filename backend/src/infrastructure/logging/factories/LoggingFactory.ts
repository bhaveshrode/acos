import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";
import { LoggerFactory } from "../../../foundation/logging/LoggerFactory.js";
import { LogLevel } from "../../../foundation/logging/LogLevel.js";
import { MinimumLevelFilter } from "../filters/MinimumLevelFilter.js";
import { LogRouter } from "../routing/LogRouter.js";
import { ConsoleLogWriter } from "../writers/ConsoleLogWriter.js";
import { FileLogWriter } from "../writers/FileLogWriter.js";
import { CompositeLogWriter } from "../writers/CompositeLogWriter.js";
import { LogWriter } from "../../../foundation/logging/Logger.js";

/**
 * Factory class assembling loggers, writers, and routing parameters.
 */
export class LoggingFactory {
  /**
   * Configures the global foundation LoggerFactory with composite writers and level filters from config.
   */
  public static configureFrom(config: ConfigurationSnapshot, logFilePath?: string): void {
    const minLevel = (config.logging.minLevel as LogLevel) || LogLevel.INFO;
    const filter = new MinimumLevelFilter(minLevel);

    const writers: LogWriter[] = [];

    // Console Log Writer is active by default
    const consoleWriter = new ConsoleLogWriter();
    writers.push(consoleWriter.writer);

    // File Log Writer is enabled if a target path is specified
    if (logFilePath) {
      const fileWriter = new FileLogWriter(logFilePath);
      writers.push(fileWriter.writer);
    }

    const composite = new CompositeLogWriter(writers);
    const router = new LogRouter(filter, composite.writer);

    LoggerFactory.configure((entry) => router.route(entry));
  }
}
