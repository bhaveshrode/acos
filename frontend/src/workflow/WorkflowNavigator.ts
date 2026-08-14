/**
 * WorkflowNavigator navigating active step indices.
 */
export class WorkflowNavigator {
  private currentStepIndex: number = 0;

  constructor(private readonly maxSteps: number) {}

  public next(): number {
    if (this.currentStepIndex < this.maxSteps - 1) {
      this.currentStepIndex++;
    }
    return this.currentStepIndex;
  }

  public prev(): number {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
    return this.currentStepIndex;
  }

  public getIndex(): number {
    return this.currentStepIndex;
  }

  public reset(): void {
    this.currentStepIndex = 0;
  }
}
