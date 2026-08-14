import { HealthCheckRunner } from "./HealthCheckRunner.js";
import { HealthAggregator } from "./HealthAggregator.js";
import { HealthResponseBuilder } from "./HealthResponseBuilder.js";

/**
 * HealthController exposing health endpoint checks handlers.
 */
export class HealthController {
  constructor(
    private readonly runner: HealthCheckRunner,
    private readonly aggregator: HealthAggregator,
    private readonly responseBuilder: HealthResponseBuilder
  ) {}

  /**
   * Runs probes, aggregates outcomes, and formats payloads, setting HTTP status.
   */
  public async handleHealth(): Promise<{ statusCode: number; payload: any }> {
    const start = Date.now();
    const results = await this.runner.run();
    const report = this.aggregator.aggregate(results, Date.now() - start);
    const payload = this.responseBuilder.build(report);

    const statusCode = report.status === "Unhealthy" ? 503 : 200;
    return { statusCode, payload };
  }
}
