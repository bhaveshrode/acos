import { WebSocketMessage } from "./WebSocketMessage.js";

/**
 * MessageBuffer storing outgoing frames while client connection is offline.
 */
export class MessageBuffer {
  private buffer: WebSocketMessage[] = [];

  public push(message: WebSocketMessage): void {
    this.buffer.push(message);
  }

  public getBuffered(): WebSocketMessage[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer = [];
  }

  public size(): number {
    return this.buffer.length;
  }
}
