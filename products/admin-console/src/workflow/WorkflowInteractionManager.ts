/**
 * WorkflowInteractionManager handling user inputs.
 */
export class WorkflowInteractionManager {
  private lastInteraction?: string;

  public handleInteraction(interaction: string): void {
    this.lastInteraction = interaction;
  }

  public getLastInteraction(): string | undefined {
    return this.lastInteraction;
  }
}
