import { SyncPlanner } from "./SyncPlanner.js";
import { SyncExecutor } from "./SyncExecutor.js";
import { ConflictResolver } from "./ConflictResolver.js";
import { CheckpointStore } from "./CheckpointStore.js";
import { SyncPipeline } from "./SyncPipeline.js";

/**
 * SynchronizationFactory composing planners, executors, conflict resolvers, and checkpoints.
 */
export class SynchronizationFactory {
  public static createPlanner(): SyncPlanner {
    return new SyncPlanner();
  }

  public static createExecutor(checkpoints?: CheckpointStore): SyncExecutor {
    return new SyncExecutor(checkpoints);
  }

  public static createResolver(): ConflictResolver {
    return new ConflictResolver();
  }

  public static createStore(): CheckpointStore {
    return new CheckpointStore();
  }

  public static createPipeline(
    planner?: SyncPlanner,
    executor?: SyncExecutor,
    resolver?: ConflictResolver,
    store?: CheckpointStore
  ): SyncPipeline {
    return new SyncPipeline(planner, executor, resolver, store);
  }

  public createPlanner(): SyncPlanner {
    return SynchronizationFactory.createPlanner();
  }

  public createExecutor(checkpoints?: CheckpointStore): SyncExecutor {
    return SynchronizationFactory.createExecutor(checkpoints);
  }

  public createResolver(): ConflictResolver {
    return SynchronizationFactory.createResolver();
  }

  public createStore(): CheckpointStore {
    return SynchronizationFactory.createStore();
  }

  public createPipeline(
    planner?: SyncPlanner,
    executor?: SyncExecutor,
    resolver?: ConflictResolver,
    store?: CheckpointStore
  ): SyncPipeline {
    return SynchronizationFactory.createPipeline(planner, executor, resolver, store);
  }
}
