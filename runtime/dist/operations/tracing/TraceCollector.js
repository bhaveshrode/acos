"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceCollector = void 0;
/**
 * TraceCollector logging active trace spans contexts.
 */
class TraceCollector {
    activeSpans = new Map();
    recordSpan(context) {
        this.activeSpans.set(context.spanId, context);
    }
    getSpan(spanId) {
        return this.activeSpans.get(spanId);
    }
    getSpans() {
        return Array.from(this.activeSpans.values());
    }
}
exports.TraceCollector = TraceCollector;
