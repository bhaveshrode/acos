import { MaintenanceTask } from "./MaintenanceTask.js";

/**
 * CleanupTask implementing basic MaintenanceTask tasks.
 */
export class CleanupTask implements MaintenanceTask {
  constructor(public readonly id: string) {}

  public async execute(): Promise<boolean> {
    return true;
  }
}
