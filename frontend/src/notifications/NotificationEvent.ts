/**
 * NotificationLifecycleType enumerating lifecycles status updates.
 */
export type NotificationLifecycleType =
  | "created"
  | "display"
  | "dismissal"
  | "expiration"
  | "interaction";

/**
 * NotificationEvent carrying detail information.
 */
export class NotificationEvent {
  constructor(
    public readonly notificationId: string,
    public readonly type: NotificationLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
