/**
 * AnalyticsLifecycleType enumerating provider tracking lifecycle steps.
 */
export type AnalyticsLifecycleType =
  | "initializing"
  | "collection"
  | "batching"
  | "flushing"
  | "shutdown";

/**
 * AnalyticsLifecycleEvent capturing provider changes.
 */
export class AnalyticsLifecycleEvent {
  constructor(
    public readonly providerId: string,
    public readonly type: AnalyticsLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
