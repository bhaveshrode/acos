/**
 * AnalyticsEvent wrapping telemetry event schemas.
 */
export class AnalyticsEvent {
  constructor(
    public readonly name: string,
    public readonly category: string,
    public readonly payload: Record<string, any> = {},
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.payload);
    Object.freeze(this);
  }
}
