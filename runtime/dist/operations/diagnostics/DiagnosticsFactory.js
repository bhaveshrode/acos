"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsFactory = void 0;
const Profiler_js_1 = require("./Profiler.js");
/**
 * DiagnosticsFactory building memory leak profilers.
 */
class DiagnosticsFactory {
    static createProfiler() {
        return new Profiler_js_1.Profiler();
    }
    createProfiler() {
        return DiagnosticsFactory.createProfiler();
    }
}
exports.DiagnosticsFactory = DiagnosticsFactory;
