/**
 * HealthPolicy defining timeout settings and allowance parameters.
 */
export class HealthPolicy {
  constructor(
    public readonly timeoutMs: number = 5000,
    public readonly allowDegradedState: boolean = true
  ) {}
}
