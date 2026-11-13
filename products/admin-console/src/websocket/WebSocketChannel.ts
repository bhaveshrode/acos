import { WebSocketMessage } from "./WebSocketMessage.js";

/**
 * WebSocketChannel grouping related messages.
 */
export class WebSocketChannel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly messages: WebSocketMessage[] = []
  ) {}
}
