import { WebSocketChannel } from "./WebSocketChannel.js";

/**
 * WebSocketChannelRegistry cataloging channels with post-boot freeze features.
 */
export class WebSocketChannelRegistry {
  private readonly catalog = new Map<string, WebSocketChannel>();
  private isFrozen: boolean = false;

  public register(channel: WebSocketChannel): void {
    if (this.isFrozen) {
      throw new Error("WebSocketChannelRegistry is frozen");
    }
    this.catalog.set(channel.id, channel);
  }

  public get(id: string): WebSocketChannel | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
