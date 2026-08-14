"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceContext = void 0;
/**
 * TraceContext encapsulating trace identifiers.
 */
class TraceContext {
    traceId;
    spanId;
    parentSpanId;
    constructor(traceId, spanId, parentSpanId) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.parentSpanId = parentSpanId;
        Object.freeze(this);
    }
}
exports.TraceContext = TraceContext;
