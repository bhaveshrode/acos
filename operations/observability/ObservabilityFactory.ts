import { LogAggregator } from "../logging/LogAggregator.js";
import { MetricsCollector } from "../metrics/MetricsCollector.js";
import { TraceCollector } from "../tracing/TraceCollector.js";
import { TelemetryCoordinator } from "./TelemetryCoordinator.js";

/**
 * ObservabilityFactory composing monitoring components and coordinators.
 */
export class ObservabilityFactory {
  public static createCoordinator(
    logger: LogAggregator,
    metrics: MetricsCollector,
    tracer: TraceCollector
  ): TelemetryCoordinator {
    return new TelemetryCoordinator(logger, metrics, tracer);
  }

  public createCoordinator(
    logger: LogAggregator,
    metrics: MetricsCollector,
    tracer: TraceCollector
  ): TelemetryCoordinator {
    return ObservabilityFactory.createCoordinator(logger, metrics, tracer);
  }
}
