"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAggregator = void 0;
/**
 * LogAggregator buffering logs for ingestion.
 */
class LogAggregator {
    logs = [];
    log(entry) {
        this.logs.push(entry);
    }
    getLogs() {
        return [...this.logs];
    }
}
exports.LogAggregator = LogAggregator;
