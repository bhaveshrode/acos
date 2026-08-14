import { WebSocketDescriptor } from "./WebSocketDescriptor.js";

/**
 * WebSocketRegistry cataloging sockets with post-boot freeze features.
 */
export class WebSocketRegistry {
  private readonly catalog = new Map<string, WebSocketDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: WebSocketDescriptor): void {
    if (this.isFrozen) {
      throw new Error("WebSocketRegistry is frozen and cannot accept further clients");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): WebSocketDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
