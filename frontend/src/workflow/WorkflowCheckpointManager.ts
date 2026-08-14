/**
 * WorkflowCheckpointManager logging checkpoints snapshots.
 */
export class WorkflowCheckpointManager {
  private readonly checkpoints = new Map<string, any>();

  public saveCheckpoint(workflowId: string, stateSnapshot: any): void {
    this.checkpoints.set(workflowId, stateSnapshot);
  }

  public getCheckpoint(workflowId: string): any | undefined {
    return this.checkpoints.get(workflowId);
  }

  public clearCheckpoint(workflowId: string): void {
    this.checkpoints.delete(workflowId);
  }
}
