/**
 * SyncPlanner outlining synchronization schedules.
 */
export class SyncPlanner {
  public plan(source: string, target: string): string {
    return `plan_sync_from_${source}_to_${target}_at_${Date.now()}`;
  }
}
