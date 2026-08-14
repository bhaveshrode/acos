/**
 * WorkflowTimeline logging workflow execution steps chronologically.
 */
export class WorkflowTimeline {
  private readonly historyNodes: string[] = [];

  public addNode(stepId: string): void {
    this.historyNodes.push(stepId);
  }

  public getNodes(): string[] {
    return [...this.historyNodes];
  }
}
