import { IMonitor } from "./IMonitor.js";

/**
 * ProcessMonitor implementing IMonitor interface.
 */
export class ProcessMonitor implements IMonitor {
  public getMetricName(): string {
    return "process_count";
  }

  public getUsage(): number {
    return 120;
  }
}
