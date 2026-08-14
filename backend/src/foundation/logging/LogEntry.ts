import { LogLevel } from "./LogLevel.js";
import { LogContext } from "./LogContext.js";
import { ValueObject } from "../core/ValueObject.js";

interface LogEntryProps {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
}

/**
 * Value Object representing an immutable log message record.
 */
export class LogEntry extends ValueObject<LogEntryProps> {
  constructor(props: Omit<LogEntryProps, "timestamp"> & { timestamp?: Date }) {
    if (!props.level) {
      throw new Error("LogEntry level must be provided.");
    }
    if (!props.message || props.message.trim() === "") {
      throw new Error("LogEntry message cannot be null or empty.");
    }
    super({
      timestamp: props.timestamp || new Date(),
      level: props.level,
      message: props.message.trim(),
      context: props.context || LogContext.empty(),
      error: props.error
    });
  }

  public get timestamp(): Date {
    return this.props.timestamp;
  }

  public get level(): LogLevel {
    return this.props.level;
  }

  public get message(): string {
    return this.props.message;
  }

  public get context(): LogContext {
    return this.props.context;
  }

  public get error(): Error | undefined {
    return this.props.error;
  }
}
