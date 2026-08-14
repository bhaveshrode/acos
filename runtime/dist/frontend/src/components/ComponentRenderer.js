"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRenderer = void 0;
const RenderResult_js_1 = require("./RenderResult.js");
/**
 * ComponentRenderer coordinating rendering runs of IComponent instances returning RenderResults.
 */
class ComponentRenderer {
    render(component) {
        const start = performance.now();
        const output = component.render();
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            componentId: component.context.metadata.id
        });
    }
}
exports.ComponentRenderer = ComponentRenderer;
