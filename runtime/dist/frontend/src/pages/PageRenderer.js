"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRenderer = void 0;
const RenderResult_js_1 = require("../components/RenderResult.js");
/**
 * PageRenderer rendering page instances returning diagnostic telemetry wraps.
 */
class PageRenderer {
    render(page) {
        const start = performance.now();
        const output = page.render();
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            pageId: page.context.metadata.id
        });
    }
}
exports.PageRenderer = PageRenderer;
