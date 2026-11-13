/**
 * WorkflowTransitionResolver evaluating next step transitions.
 */
export class WorkflowTransitionResolver {
  public resolveNextStep(currentStepIndex: number, outcome: string): number {
    if (outcome === "approve") {
      return currentStepIndex + 2;
    }
    return currentStepIndex + 1;
  }
}
