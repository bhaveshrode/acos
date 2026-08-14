import { ScaleDirection } from "./ScaleDirection.js";

/**
 * Autoscaler evaluating load signals.
 */
export class Autoscaler {
  public evaluate(cpuUsage: number): ScaleDirection | undefined {
    if (cpuUsage > 80) return ScaleDirection.Up;
    if (cpuUsage < 20) return ScaleDirection.Down;
    return undefined;
  }
}
