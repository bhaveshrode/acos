import { HealthStatus } from "./HealthStatus.js";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  durationMs: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * HealthReport summarizing all registered system dependency check outcomes.
 */
export class HealthReport {
  constructor(
    public readonly status: HealthStatus,
    public readonly results: HealthCheckResult[] = [],
    public readonly durationMs: number = 0,
    public readonly timestamp: Date = new Date()
  ) {}
}
