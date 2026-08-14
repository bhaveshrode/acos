import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * DatabaseHealthCheck probing the underlying database resource.
 */
export class DatabaseHealthCheck implements IHealthCheck {
  public readonly name = "Database";
  constructor(private readonly dbHealthMonitor?: { ping(): Promise<any> }) {}

  public async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      if (this.dbHealthMonitor) {
        await this.dbHealthMonitor.ping();
      }
      return {
        name: this.name,
        status: HealthStatus.Healthy,
        durationMs: Date.now() - start
      };
    } catch (err: any) {
      return {
        name: this.name,
        status: HealthStatus.Unhealthy,
        durationMs: Date.now() - start,
        error: err.message
      };
    }
  }
}
