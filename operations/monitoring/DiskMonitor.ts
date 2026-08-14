import { IMonitor } from "./IMonitor.js";

/**
 * DiskMonitor implementing IMonitor interface.
 */
export class DiskMonitor implements IMonitor {
  public getMetricName(): string {
    return "disk_load";
  }

  public getUsage(): number {
    return 60;
  }
}
