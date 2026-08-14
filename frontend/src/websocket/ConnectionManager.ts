import { IWebSocketClient } from "./IWebSocketClient.js";

/**
 * ConnectionManager coordinating connection and disconnection states.
 */
export class ConnectionManager {
  constructor(private readonly client: IWebSocketClient) {}

  public connect(): void {
    this.client.connect();
  }

  public disconnect(): void {
    this.client.disconnect();
  }
}
