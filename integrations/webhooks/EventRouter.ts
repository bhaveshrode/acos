import { WebhookRegistry } from "./WebhookRegistry.js";

/**
 * EventRouter mapping endpoints to callbacks from registry.
 */
export class EventRouter {
  constructor(private readonly registry: WebhookRegistry) {}

  public route(endpoint: string): ((payload: any) => Promise<void>) | undefined {
    return this.registry.getCallback(endpoint);
  }
}
