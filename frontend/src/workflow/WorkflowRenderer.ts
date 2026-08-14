import { IWorkflow } from "./IWorkflow.js";
import { RenderResult } from "../components/RenderResult.js";

/**
 * WorkflowRenderer rendering workflows and returning RenderResult telemetry wraps.
 */
export class WorkflowRenderer {
  public render(workflow: IWorkflow): RenderResult {
    const start = performance.now();
    const output = `<div class="workflow-view">${workflow.state}</div>`;
    const duration = performance.now() - start;
    return new RenderResult(output, duration, {
      workflowId: workflow.context.metadata.id
    });
  }
}
