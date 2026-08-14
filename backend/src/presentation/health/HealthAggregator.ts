import { HealthReport, HealthCheckResult } from "./HealthReport.js";
import { HealthStatus } from "./HealthStatus.js";

/**
 * HealthAggregator combining individual outcomes. Unhealthy dominates Degraded, which dominates Healthy.
 */
export class HealthAggregator {
  public aggregate(results: HealthCheckResult[], durationMs: number): HealthReport {
    let overallStatus = HealthStatus.Healthy;

    for (const res of results) {
      if (res.status === HealthStatus.Unhealthy) {
        overallStatus = HealthStatus.Unhealthy;
        break;
      }
      if (res.status === HealthStatus.Degraded) {
        overallStatus = HealthStatus.Degraded;
      }
    }

    return new HealthReport(overallStatus, results, durationMs);
  }
}
