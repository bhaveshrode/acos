"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profiler = void 0;
const DiagnosticReport_js_1 = require("./DiagnosticReport.js");
/**
 * Profiler tracking simulated heap issues.
 */
class Profiler {
    analyzeMemory(heapBytes) {
        const issues = [];
        if (heapBytes > 1024 * 1024 * 1024) {
            issues.push("High memory utilization: potential memory leak");
        }
        return new DiagnosticReport_js_1.DiagnosticReport(issues.length > 0, issues);
    }
}
exports.Profiler = Profiler;
