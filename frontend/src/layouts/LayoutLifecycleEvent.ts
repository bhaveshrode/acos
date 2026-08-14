/**
 * LayoutLifecycleType capturing layout status.
 */
export type LayoutLifecycleType = "initializing" | "rendering" | "active" | "destroyed";

/**
 * LayoutLifecycleEvent recording transition details.
 */
export class LayoutLifecycleEvent {
  constructor(
    public readonly layoutId: string,
    public readonly type: LayoutLifecycleType,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this);
  }
}
