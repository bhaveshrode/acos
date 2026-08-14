import { WebSocketContext } from "./WebSocketContext.js";

/**
 * ConnectionRegistry tracking connection IDs to active socket references and contexts.
 */
export class ConnectionRegistry {
  private static connections = new Map<string, { socket: any; context: WebSocketContext }>();

  public static register(connectionId: string, socket: any, context: WebSocketContext): void {
    this.connections.set(connectionId, { socket, context });
  }

  public static unregister(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  public static get(connectionId: string): { socket: any; context: WebSocketContext } | undefined {
    return this.connections.get(connectionId);
  }

  public static getAll(): { socket: any; context: WebSocketContext }[] {
    return Array.from(this.connections.values());
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.connections.clear();
  }
}
