import { MetricValue } from "./MetricValue.js";

/**
 * MetricsCollector aggregating metrics values.
 */
export class MetricsCollector {
  private readonly metrics = new Map<string, MetricValue>();

  public record(value: MetricValue): void {
    this.metrics.set(value.name, value);
  }

  public get(name: string): MetricValue | undefined {
    return this.metrics.get(name);
  }

  public getAll(): MetricValue[] {
    return Array.from(this.metrics.values());
  }
}
