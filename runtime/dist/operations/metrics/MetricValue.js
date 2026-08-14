"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricValue = void 0;
/**
 * MetricValue representing single metric entries.
 */
class MetricValue {
    name;
    type;
    value;
    timestamp;
    labels;
    constructor(name, type, value, timestamp = Date.now(), labels = {}) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.timestamp = timestamp;
        this.labels = labels;
        Object.freeze(this.labels);
        Object.freeze(this);
    }
}
exports.MetricValue = MetricValue;
