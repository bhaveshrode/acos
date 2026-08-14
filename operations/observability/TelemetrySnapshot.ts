import { LogEntry } from "../logging/LogEntry.js";
import { MetricValue } from "../metrics/MetricValue.js";
import { TraceContext } from "../tracing/TraceContext.js";

/**
 * TelemetrySnapshot packaging combined logs, metrics, and traces arrays.
 */
export class TelemetrySnapshot {
  constructor(
    public readonly logs: LogEntry[],
    public readonly metrics: MetricValue[],
    public readonly traces: TraceContext[],
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.logs);
    Object.freeze(this.metrics);
    Object.freeze(this.traces);
    Object.freeze(this);
  }
}
