import { MetricType } from "./MetricType.js";
import { MetricValue } from "./MetricValue.js";
import { MetricsCollector } from "./MetricsCollector.js";

/**
 * MetricsFactory constructing collector and metrics objects.
 */
export class MetricsFactory {
  public static createValue(
    name: string,
    type: MetricType,
    value: number,
    labels?: Record<string, string>
  ): MetricValue {
    return new MetricValue(name, type, value, Date.now(), labels);
  }

  public static createCollector(): MetricsCollector {
    return new MetricsCollector();
  }

  public createValue(
    name: string,
    type: MetricType,
    value: number,
    labels?: Record<string, string>
  ): MetricValue {
    return MetricsFactory.createValue(name, type, value, labels);
  }

  public createCollector(): MetricsCollector {
    return MetricsFactory.createCollector();
  }
}
