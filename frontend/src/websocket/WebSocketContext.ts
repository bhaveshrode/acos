import { WebSocketMetadata } from "./WebSocketMetadata.js";

/**
 * WebSocketContext carrying active connection records and channel subscriptions.
 */
export class WebSocketContext {
  constructor(
    public readonly metadata: WebSocketMetadata,
    public readonly activeConnections: ReadonlyArray<string> = [],
    public readonly subscriptions: ReadonlyArray<string> = [],
    public readonly pendingRequests: ReadonlyArray<string> = []
  ) {
    Object.freeze(this.activeConnections);
    Object.freeze(this.subscriptions);
    Object.freeze(this.pendingRequests);
    Object.freeze(this);
  }
}
