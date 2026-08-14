"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricType = void 0;
/**
 * MetricType enum outlining counter, gauge, and histogram classifications.
 */
var MetricType;
(function (MetricType) {
    MetricType["Counter"] = "Counter";
    MetricType["Gauge"] = "Gauge";
    MetricType["Histogram"] = "Histogram";
    MetricType["Summary"] = "Summary";
})(MetricType || (exports.MetricType = MetricType = {}));
