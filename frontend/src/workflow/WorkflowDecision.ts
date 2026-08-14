/**
 * WorkflowDecision carrying outcome steps and run durations.
 */
export class WorkflowDecision {
  constructor(
    public readonly isSuccess: boolean,
    public readonly completedSteps: string[] = [],
    public readonly failures: string[] = [],
    public readonly durationMs: number = 0
  ) {
    Object.freeze(this.completedSteps);
    Object.freeze(this.failures);
    Object.freeze(this);
  }
}
