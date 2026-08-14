import { HealthCheckResult } from "./HealthReport.js";

export interface IHealthCheck {
  name: string;
  check(): Promise<HealthCheckResult>;
}
