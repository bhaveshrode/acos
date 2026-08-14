import { ConnectionRegistry } from "./ConnectionRegistry.js";
import { SocketMessage } from "./SocketMessage.js";

/**
 * MessageDispatcher broadcasting event details payloads.
 */
export class MessageDispatcher {
  public send(connectionId: string, message: SocketMessage): void {
    const conn = ConnectionRegistry.get(connectionId);
    if (conn && conn.socket && typeof conn.socket.send === "function") {
      conn.socket.send(JSON.stringify(message));
    }
  }

  public broadcast(message: SocketMessage): void {
    for (const conn of ConnectionRegistry.getAll()) {
      if (conn.socket && typeof conn.socket.send === "function") {
        conn.socket.send(JSON.stringify(message));
      }
    }
  }
}
