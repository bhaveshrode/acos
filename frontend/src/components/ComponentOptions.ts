/**
 * ComponentOptions specifying lazy and caching targets.
 */
export interface ComponentOptions {
  lazy?: boolean;
  cache?: boolean;
  renderMode?: "sync" | "async";
}
