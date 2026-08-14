/**
 * FactoryOptions defining lifetimes and dependency resolution strategies.
 */
export interface FactoryOptions {
  initializationBehavior?: "Lazy" | "Eager";
  resolutionStrategy?: "Singleton" | "Transient";
  singletonLifetimes?: Record<string, number>;
  compositionSettings?: Record<string, any>;
}
