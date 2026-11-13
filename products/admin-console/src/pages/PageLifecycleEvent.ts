/**
 * PageLifecycleType capturing page lifecycle transitions categories.
 */
export type PageLifecycleType =
  | "initializing"
  | "loading"
  | "ready"
  | "refreshing"
  | "error"
  | "destroyed";

/**
 * PageLifecycleEvent capturing detailed page lifecycle transitions.
 */
export class PageLifecycleEvent {
  constructor(
    public readonly pageId: string,
    public readonly type: PageLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
