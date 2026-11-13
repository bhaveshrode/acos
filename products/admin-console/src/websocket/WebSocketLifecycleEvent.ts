/**
 * WebSocketLifecycleType listing categories.
 */
export type WebSocketLifecycleType =
  | "connection"
  | "disconnection"
  | "reconnection"
  | "subscription"
  | "messaging";

/**
 * WebSocketLifecycleEvent tracking connection states changes.
 */
export class WebSocketLifecycleEvent {
  constructor(
    public readonly clientId: string,
    public readonly type: WebSocketLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
