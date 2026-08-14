import { ConnectionManager } from "./ConnectionManager.js";

/**
 * ConnectionHandler handling incoming connection setups and cleanups.
 */
export class ConnectionHandler {
  constructor(private readonly manager: ConnectionManager) {}

  public handleConnect(connectionId: string, socket: any): void {
    this.manager.connect(connectionId, socket);
  }

  public handleDisconnect(connectionId: string): void {
    this.manager.disconnect(connectionId);
  }
}
