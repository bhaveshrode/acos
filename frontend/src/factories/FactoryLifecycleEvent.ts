/**
 * FactoryLifecycleType listing composition tracking categories.
 */
export type FactoryLifecycleType =
  | "registration"
  | "initialization"
  | "composition"
  | "startup"
  | "shutdown";

/**
 * FactoryLifecycleEvent capturing factory changes.
 */
export class FactoryLifecycleEvent {
  constructor(
    public readonly factoryId: string,
    public readonly type: FactoryLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
