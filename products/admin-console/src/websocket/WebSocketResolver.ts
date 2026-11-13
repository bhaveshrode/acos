import { WebSocketRegistry } from "./WebSocketRegistry.js";
import { WebSocketDescriptor } from "./WebSocketDescriptor.js";

/**
 * WebSocketResolver resolving client constructors by catalog ID.
 */
export class WebSocketResolver {
  constructor(private readonly registry: WebSocketRegistry) {}

  public resolve(id: string): WebSocketDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`WebSocket client with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
