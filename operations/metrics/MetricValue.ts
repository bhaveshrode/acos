import { MetricType } from "./MetricType.js";

/**
 * MetricValue representing single metric entries.
 */
export class MetricValue {
  constructor(
    public readonly name: string,
    public readonly type: MetricType,
    public readonly value: number,
    public readonly timestamp: number = Date.now(),
    public readonly labels: Record<string, string> = {}
  ) {
    Object.freeze(this.labels);
    Object.freeze(this);
  }
}
