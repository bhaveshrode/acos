/**
 * WorkflowProgressTracker computing progress percentages from step indices.
 */
export class WorkflowProgressTracker {
  public getProgressPercent(currentStepIndex: number, maxSteps: number): number {
    if (maxSteps <= 0) return 0;
    return Math.round((currentStepIndex / maxSteps) * 100);
  }
}
