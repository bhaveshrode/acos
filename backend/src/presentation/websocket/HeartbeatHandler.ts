import { ConnectionRegistry } from "./ConnectionRegistry.js";

/**
 * HeartbeatHandler keeping track of connection alive timers.
 */
export class HeartbeatHandler {
  public handlePing(connectionId: string): void {
    const conn = ConnectionRegistry.get(connectionId);
    if (conn) {
      (conn.context.props as any).lastHeartbeat = new Date();
    }
  }
}
