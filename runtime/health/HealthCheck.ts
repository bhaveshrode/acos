/**
 * HealthCheck carrying individual check metrics.
 */
export class HealthCheck {
  constructor(
    public readonly name: string,
    public readonly isHealthy: boolean,
    public readonly errorDetails?: string
  ) {
    Object.freeze(this);
  }
}
