import { IWorkflow } from "./IWorkflow.js";

/**
 * WorkflowValidator evaluating workflow validation rules.
 */
export class WorkflowValidator {
  public validate(workflow: IWorkflow): string[] {
    const errors: string[] = [];
    if (!workflow.context.metadata.id) {
      errors.push("Workflow ID is required");
    }
    return errors;
  }
}
