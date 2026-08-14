import { WorkflowStep } from "./WorkflowStep.js";

/**
 * WorkflowStepGroup organizing related steps into logical execution phases.
 */
export class WorkflowStepGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly steps: WorkflowStep[] = []
  ) {}
}
