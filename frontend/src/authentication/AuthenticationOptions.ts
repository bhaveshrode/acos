/**
 * AuthenticationOptions specifying remember-me and durations timeouts.
 */
export interface AuthenticationOptions {
  sessionTimeoutMs?: number;
  refreshThresholdMs?: number;
  rememberMe?: boolean;
  storageKey?: string;
}
