/**
 * IMonitor interface declaring unified resource monitors.
 */
export interface IMonitor {
  getMetricName(): string;
  getUsage(): number;
}
