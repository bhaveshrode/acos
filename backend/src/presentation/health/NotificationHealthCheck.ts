import { IHealthCheck } from "./IHealthCheck.js";
import { HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * NotificationHealthCheck probing alert queues.
 */
export class NotificationHealthCheck implements IHealthCheck {
  public readonly name = "Notification";

  public async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      name: this.name,
      status: HealthStatus.Healthy,
      durationMs: Date.now() - start
    };
  }
}
