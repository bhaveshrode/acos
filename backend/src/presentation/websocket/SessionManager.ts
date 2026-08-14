import { ConnectionRegistry } from "./ConnectionRegistry.js";

/**
 * SessionManager associating authenticated user references with active connection sockets.
 */
export class SessionManager {
  public getConnectionsForUser(userId: string): { socket: any; context: any }[] {
    return ConnectionRegistry.getAll().filter((conn) => conn.context.props.userId === userId);
  }
}
