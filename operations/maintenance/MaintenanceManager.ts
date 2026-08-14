import { MaintenanceTask } from "./MaintenanceTask.js";

/**
 * MaintenanceManager executing scheduled cleanups.
 */
export class MaintenanceManager {
  private readonly tasks: MaintenanceTask[] = [];

  public addTask(task: MaintenanceTask): void {
    this.tasks.push(task);
  }

  public async runAll(): Promise<boolean[]> {
    const results: boolean[] = [];
    for (const task of this.tasks) {
      results.push(await task.execute());
    }
    return results;
  }
}
