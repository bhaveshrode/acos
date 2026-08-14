"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderResult = void 0;
/**
 * RenderResult wrapping output templates, elapsed render duration, and metadata diagnostics.
 */
class RenderResult {
    output;
    duration;
    diagnostics;
    constructor(output, duration, diagnostics = {}) {
        this.output = output;
        this.duration = duration;
        this.diagnostics = diagnostics;
        Object.freeze(this.diagnostics);
        Object.freeze(this);
    }
}
exports.RenderResult = RenderResult;
