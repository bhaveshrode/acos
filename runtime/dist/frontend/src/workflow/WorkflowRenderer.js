"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRenderer = void 0;
const RenderResult_js_1 = require("../components/RenderResult.js");
/**
 * WorkflowRenderer rendering workflows and returning RenderResult telemetry wraps.
 */
class WorkflowRenderer {
    render(workflow) {
        const start = performance.now();
        const output = `<div class="workflow-view">${workflow.state}</div>`;
        const duration = performance.now() - start;
        return new RenderResult_js_1.RenderResult(output, duration, {
            workflowId: workflow.context.metadata.id
        });
    }
}
exports.WorkflowRenderer = WorkflowRenderer;
