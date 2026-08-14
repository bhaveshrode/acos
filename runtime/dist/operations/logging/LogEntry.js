"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogEntry = void 0;
/**
 * LogEntry wrapping structured logging fields.
 */
class LogEntry {
    level;
    message;
    timestamp;
    metadata;
    constructor(level, message, timestamp = Date.now(), metadata = {}) {
        this.level = level;
        this.message = message;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this.metadata);
        Object.freeze(this);
    }
}
exports.LogEntry = LogEntry;
