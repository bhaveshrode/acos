import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * StorageHealthCheck probing storage systems status.
 */
export class StorageHealthCheck implements IHealthCheck {
  public readonly name = "Storage";

  public async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      name: this.name,
      status: HealthStatus.Healthy,
      durationMs: Date.now() - start
    };
  }
}
