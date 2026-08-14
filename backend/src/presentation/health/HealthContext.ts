/**
 * HealthContext aggregating health check metadata tags.
 */
export class HealthContext {
  constructor(
    public readonly timestamp: Date = new Date(),
    public readonly metadata: Record<string, any> = {}
  ) {}
}
