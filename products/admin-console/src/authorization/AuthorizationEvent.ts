/**
 * AuthorizationEventType representing categories of authorization occurrences.
 */
export type AuthorizationEventType = "permissionUpdate" | "policyChange" | "accessDenied";

/**
 * AuthorizationEvent carrying timestamps and incident metadata.
 */
export class AuthorizationEvent {
  constructor(
    public readonly type: AuthorizationEventType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
