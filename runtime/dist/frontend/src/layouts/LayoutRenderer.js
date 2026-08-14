"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutRenderer = void 0;
const RenderResult_js_1 = require("../components/RenderResult.js");
/**
 * LayoutRenderer rendering layouts and returning RenderResult objects.
 */
class LayoutRenderer {
    render(layout) {
        const start = performance.now();
        const output = layout.render();
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            layoutId: layout.context.metadata.id
        });
    }
}
exports.LayoutRenderer = LayoutRenderer;
