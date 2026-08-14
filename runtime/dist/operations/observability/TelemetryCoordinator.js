"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryCoordinator = void 0;
const TelemetrySnapshot_js_1 = require("./TelemetrySnapshot.js");
/**
 * TelemetryCoordinator extracting system-wide metrics logs snapshots.
 */
class TelemetryCoordinator {
    logger;
    metrics;
    tracer;
    constructor(logger, metrics, tracer) {
        this.logger = logger;
        this.metrics = metrics;
        this.tracer = tracer;
    }
    captureSnapshot() {
        return new TelemetrySnapshot_js_1.TelemetrySnapshot(this.logger.getLogs(), this.metrics.getAll(), this.tracer.getSpans());
    }
}
exports.TelemetryCoordinator = TelemetryCoordinator;
