import { IMonitor } from "./IMonitor.js";

/**
 * CpuMonitor implementing IMonitor interface.
 */
export class CpuMonitor implements IMonitor {
  public getMetricName(): string {
    return "cpu_load";
  }

  public getUsage(): number {
    return 15;
  }
}
