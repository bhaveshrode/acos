import { CleanupTask } from "./CleanupTask.js";
import { MaintenanceManager } from "./MaintenanceManager.js";

/**
 * MaintenanceFactory building cleanups tasks.
 */
export class MaintenanceFactory {
  public static createCleanupTask(id: string): CleanupTask {
    return new CleanupTask(id);
  }

  public static createManager(): MaintenanceManager {
    return new MaintenanceManager();
  }

  public createCleanupTask(id: string): CleanupTask {
    return MaintenanceFactory.createCleanupTask(id);
  }

  public createManager(): MaintenanceManager {
    return MaintenanceFactory.createManager();
  }
}
