import { WorkflowMetadata } from "./WorkflowMetadata.js";

/**
 * WorkflowDescriptor pairing workflow constructors with step metadata definitions.
 */
export class WorkflowDescriptor {
  constructor(
    public readonly metadata: WorkflowMetadata,
    public readonly workflowClass: any,
    public readonly stepDefinitions: any[] = []
  ) {
    Object.freeze(this.stepDefinitions);
    Object.freeze(this);
  }
}
