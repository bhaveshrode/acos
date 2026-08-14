/**
 * IRateLimiter declaring authorization rate checks.
 */
export interface IRateLimiter {
  allowRequest(): boolean;
}
