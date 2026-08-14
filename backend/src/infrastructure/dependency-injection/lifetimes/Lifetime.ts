/**
 * Defines service resolution caching and lifetime policies within the container.
 */
export enum Lifetime {
  /**
   * Instantiated once per container life. Cached globally.
   */
  SINGLETON = "SINGLETON",

  /**
   * Instantiated once per scope context execution request.
   */
  SCOPED = "SCOPED",

  /**
   * Instantiated fresh on every resolution request.
   */
  TRANSIENT = "TRANSIENT"
}
