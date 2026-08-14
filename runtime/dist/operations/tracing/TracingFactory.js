"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingFactory = void 0;
const TraceContext_js_1 = require("./TraceContext.js");
const TraceCollector_js_1 = require("./TraceCollector.js");
const TraceExporter_js_1 = require("./TraceExporter.js");
/**
 * TracingFactory building collectors and exporters.
 */
class TracingFactory {
    static createContext(traceId, spanId, parentSpanId) {
        return new TraceContext_js_1.TraceContext(traceId, spanId, parentSpanId);
    }
    static createCollector() {
        return new TraceCollector_js_1.TraceCollector();
    }
    static createExporter() {
        return new TraceExporter_js_1.TraceExporter();
    }
    createContext(traceId, spanId, parentSpanId) {
        return TracingFactory.createContext(traceId, spanId, parentSpanId);
    }
    createCollector() {
        return TracingFactory.createCollector();
    }
    createExporter() {
        return TracingFactory.createExporter();
    }
}
exports.TracingFactory = TracingFactory;
