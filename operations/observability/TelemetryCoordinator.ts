import { LogAggregator } from "../logging/LogAggregator.js";
import { MetricsCollector } from "../metrics/MetricsCollector.js";
import { TraceCollector } from "../tracing/TraceCollector.js";
import { TelemetrySnapshot } from "./TelemetrySnapshot.js";

/**
 * TelemetryCoordinator extracting system-wide metrics logs snapshots.
 */
export class TelemetryCoordinator {
  constructor(
    private readonly logger: LogAggregator,
    private readonly metrics: MetricsCollector,
    private readonly tracer: TraceCollector
  ) {}

  public captureSnapshot(): TelemetrySnapshot {
    return new TelemetrySnapshot(
      this.logger.getLogs(),
      this.metrics.getAll(),
      this.tracer.getSpans()
    );
  }
}
