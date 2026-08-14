import { HealthReport } from "./HealthReport.js";

/**
 * HealthResponseBuilder constructing standard JSON reports carrying timestamp and component details maps.
 */
export class HealthResponseBuilder {
  public build(report: HealthReport): any {
    return {
      status: report.status,
      timestamp: report.timestamp.toISOString(),
      durationMs: report.durationMs,
      details: report.results.reduce((acc, r) => {
        acc[r.name] = {
          status: r.status,
          durationMs: r.durationMs,
          error: r.error,
          metadata: r.metadata
        };
        return acc;
      }, {} as Record<string, any>)
    };
  }
}
