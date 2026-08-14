import { WorkflowStep } from "./WorkflowStep.js";

/**
 * WorkflowStepRegistry storing reusable steps with freezing capability.
 */
export class WorkflowStepRegistry {
  private readonly catalog = new Map<string, WorkflowStep>();
  private isFrozen: boolean = false;

  public register(step: WorkflowStep): void {
    if (this.isFrozen) {
      throw new Error("WorkflowStepRegistry is frozen");
    }
    this.catalog.set(step.id, step);
  }

  public get(id: string): WorkflowStep | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
