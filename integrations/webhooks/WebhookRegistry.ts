/**
 * WebhookRegistry cataloging callback hooks.
 */
export class WebhookRegistry {
  private readonly callbacks = new Map<string, (payload: any) => Promise<void>>();

  public registerCallback(endpoint: string, callback: (payload: any) => Promise<void>): void {
    this.callbacks.set(endpoint, callback);
  }

  public getCallback(endpoint: string): ((payload: any) => Promise<void>) | undefined {
    return this.callbacks.get(endpoint);
  }
}
