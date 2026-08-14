import { SyncState } from "./SyncState.js";
import { SyncPlanner } from "./SyncPlanner.js";
import { SyncExecutor } from "./SyncExecutor.js";
import { ConflictResolver } from "./ConflictResolver.js";
import { CheckpointStore } from "./CheckpointStore.js";

/**
 * SyncPipeline orchestrating synchronization loops with activePlanId exposure.
 */
export class SyncPipeline {
  public state: SyncState = SyncState.Idle;
  public activePlanId?: string;

  constructor(
    public readonly planner: SyncPlanner = new SyncPlanner(),
    public readonly executor: SyncExecutor = new SyncExecutor(),
    public readonly conflicts: ConflictResolver = new ConflictResolver(),
    public readonly checkpoints: CheckpointStore = new CheckpointStore()
  ) {}

  public async executeSync(
    source: string,
    target: string,
    runFn: () => Promise<boolean>
  ): Promise<boolean> {
    this.state = SyncState.Synchronizing;
    const planId = this.planner.plan(source, target);
    this.activePlanId = planId;
    const success = await this.executor.execute(planId, runFn);
    this.state = success ? SyncState.Completed : SyncState.Failed;
    return success;
  }
}
