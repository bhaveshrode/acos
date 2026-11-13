import { WorkflowMetadata } from "./WorkflowMetadata.js";

/**
 * WorkflowContext carrying runtime parameter variables.
 */
export class WorkflowContext {
  constructor(
    public readonly metadata: WorkflowMetadata,
    public readonly variables: Readonly<Record<string, any>> = {},
    public readonly executionMetadata: Readonly<Record<string, any>> = {},
    public readonly userContext: any = null,
    public readonly runtimeState: any = null
  ) {
    Object.freeze(this.variables);
    Object.freeze(this.executionMetadata);
    Object.freeze(this);
  }
}
