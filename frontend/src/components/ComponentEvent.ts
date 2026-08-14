/**
 * ComponentEventType capturing lifecycle categories.
 */
export type ComponentEventType = "mounted" | "updated" | "destroyed";

/**
 * ComponentEvent recording component identifiers and timing parameters.
 */
export class ComponentEvent {
  constructor(
    public readonly componentId: string,
    public readonly type: ComponentEventType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
