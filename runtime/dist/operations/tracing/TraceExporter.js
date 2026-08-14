"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceExporter = void 0;
/**
 * TraceExporter exporting collected traces payloads.
 */
class TraceExporter {
    async export(spans) {
        return spans.length > 0;
    }
}
exports.TraceExporter = TraceExporter;
