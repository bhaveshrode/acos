import { CheckpointStore } from "./CheckpointStore.js";

/**
 * SyncExecutor running incremental synchronization tasks.
 */
export class SyncExecutor {
  constructor(private readonly checkpoints: CheckpointStore = new CheckpointStore()) {}

  public async execute(
    planId: string,
    runSync: () => Promise<boolean>
  ): Promise<boolean> {
    const success = await runSync();
    if (success) {
      this.checkpoints.saveCheckpoint(planId, `checkpoint_${Date.now()}`);
    }
    return success;
  }
}
