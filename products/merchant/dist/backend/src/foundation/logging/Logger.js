import { LogLevel } from "./LogLevel.js";
import { LogContext } from "./LogContext.js";
import { LogEntry } from "./LogEntry.js";
/**
 * Standard implementation of ILogger contract.
 * Decoupled from transport outputs (e.g., console/Pino) via an injectable LogWriter callback.
 */
export class Logger {
    categoryName;
    writer;
    currentContext;
    constructor(categoryName, writer, initialContext = LogContext.empty()) {
        this.categoryName = categoryName;
        this.writer = writer;
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
    withContext(context) {
        const merged = this.currentContext.merge(context);
        return new Logger(this.categoryName, this.writer, merged);
    }
    /**
     * Maps arguments into an immutable LogEntry object and dispatches to the destination writer.
     */
    write(level, message, contextObj, error) {
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
    info(message, context) {
        this.write(LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.write(LogLevel.WARN, message, context);
    }
    error(message, error, context) {
        this.write(LogLevel.ERROR, message, context, error);
    }
    debug(message, context) {
        this.write(LogLevel.DEBUG, message, context);
    }
    trace(message, context) {
        this.write(LogLevel.TRACE, message, context);
    }
    /**
     * Logs a critical system-wide operational failure.
     */
    critical(message, error, context) {
        this.write(LogLevel.CRITICAL, message, context, error);
    }
}
