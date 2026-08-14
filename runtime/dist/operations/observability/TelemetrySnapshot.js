"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetrySnapshot = void 0;
/**
 * TelemetrySnapshot packaging combined logs, metrics, and traces arrays.
 */
class TelemetrySnapshot {
    logs;
    metrics;
    traces;
    timestamp;
    constructor(logs, metrics, traces, timestamp = Date.now()) {
        this.logs = logs;
        this.metrics = metrics;
        this.traces = traces;
        this.timestamp = timestamp;
        Object.freeze(this.logs);
        Object.freeze(this.metrics);
        Object.freeze(this.traces);
        Object.freeze(this);
    }
}
exports.TelemetrySnapshot = TelemetrySnapshot;
