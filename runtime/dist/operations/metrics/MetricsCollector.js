"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
/**
 * MetricsCollector aggregating metrics values.
 */
class MetricsCollector {
    metrics = new Map();
    record(value) {
        this.metrics.set(value.name, value);
    }
    get(name) {
        return this.metrics.get(name);
    }
    getAll() {
        return Array.from(this.metrics.values());
    }
}
exports.MetricsCollector = MetricsCollector;
