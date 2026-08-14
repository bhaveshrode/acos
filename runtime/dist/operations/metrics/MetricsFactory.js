"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const MetricValue_js_1 = require("./MetricValue.js");
const MetricsCollector_js_1 = require("./MetricsCollector.js");
/**
 * MetricsFactory constructing collector and metrics objects.
 */
class MetricsFactory {
    static createValue(name, type, value, labels) {
        return new MetricValue_js_1.MetricValue(name, type, value, Date.now(), labels);
    }
    static createCollector() {
        return new MetricsCollector_js_1.MetricsCollector();
    }
    createValue(name, type, value, labels) {
        return MetricsFactory.createValue(name, type, value, labels);
    }
    createCollector() {
        return MetricsFactory.createCollector();
    }
}
exports.MetricsFactory = MetricsFactory;
