/**
 * WorkflowOptions specifying retry behaviors and timeouts settings.
 */
export interface WorkflowOptions {
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeoutMs?: number;
  concurrencyMode?: "Sequential" | "Parallel";
  persistenceStrategy?: "Memory" | "LocalStorage";
}
