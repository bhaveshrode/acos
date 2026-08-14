/**
 * ComponentLifecycleType enumerating target stages.
 */
export type ComponentLifecycleType = "mounted" | "updated" | "destroyed";

/**
 * ComponentLifecycleEvent capturing component state modifications.
 */
export class ComponentLifecycleEvent {
  constructor(
    public readonly componentId: string,
    public readonly type: ComponentLifecycleType,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this);
  }
}
