import { IWebSocketClient } from "./IWebSocketClient.js";
import { WebSocketMessage } from "./WebSocketMessage.js";
import { WebSocketState } from "./WebSocketState.js";
import { WebSocketContext } from "./WebSocketContext.js";

/**
 * BaseWebSocketClient buffering unsent frames when connection drops.
 */
export abstract class BaseWebSocketClient implements IWebSocketClient {
  public state: WebSocketState = WebSocketState.Disconnected;
  protected readonly buffer: WebSocketMessage[] = [];

  constructor(public readonly context: WebSocketContext) {}

  public connect(): void {
    this.state = WebSocketState.Connecting;
    this.onConnect();
  }

  public disconnect(): void {
    this.state = WebSocketState.Closing;
    this.onDisconnect();
    this.state = WebSocketState.Closed;
  }

  public send(message: WebSocketMessage): void {
    if (this.state === WebSocketState.Connected) {
      this.onSend(message);
    } else {
      this.buffer.push(message);
    }
  }

  public getBufferedMessages(): WebSocketMessage[] {
    return [...this.buffer];
  }

  public clearBuffer(): void {
    this.buffer.length = 0;
  }

  protected abstract onConnect(): void;
  protected abstract onDisconnect(): void;
  protected abstract onSend(message: WebSocketMessage): void;
}
