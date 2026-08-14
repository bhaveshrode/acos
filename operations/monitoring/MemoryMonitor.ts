import { IMonitor } from "./IMonitor.js";

/**
 * MemoryMonitor implementing IMonitor interface.
 */
export class MemoryMonitor implements IMonitor {
  public getMetricName(): string {
    return "memory_load";
  }

  public getUsage(): number {
    return 45;
  }
}
