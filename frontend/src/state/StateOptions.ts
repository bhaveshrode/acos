/**
 * StateOptions defining persistence limits config options.
 */
export interface StateOptions {
  persistenceKey?: string;
  historyLimit?: number;
  syncIntervalMs?: number;
}
