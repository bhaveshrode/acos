import { ConnectionRegistry } from "./ConnectionRegistry.js";
import { WebSocketContext } from "./WebSocketContext.js";
import { ConnectionState } from "./ConnectionState.js";

/**
 * ConnectionManager coordinating setups and teardowns.
 */
export class ConnectionManager {
  public connect(connectionId: string, socket: any): WebSocketContext {
    const context = new WebSocketContext({
      connectionId,
      state: ConnectionState.Connected
    });
    ConnectionRegistry.register(connectionId, socket, context);
    return context;
  }

  public disconnect(connectionId: string): void {
    ConnectionRegistry.unregister(connectionId);
  }
}
