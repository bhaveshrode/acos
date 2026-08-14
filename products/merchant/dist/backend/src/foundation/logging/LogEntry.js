import { LogContext } from "./LogContext.js";
import { ValueObject } from "../core/ValueObject.js";
/**
 * Value Object representing an immutable log message record.
 */
export class LogEntry extends ValueObject {
    constructor(props) {
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
    get timestamp() {
        return this.props.timestamp;
    }
    get level() {
        return this.props.level;
    }
    get message() {
        return this.props.message;
    }
    get context() {
        return this.props.context;
    }
    get error() {
        return this.props.error;
    }
}
