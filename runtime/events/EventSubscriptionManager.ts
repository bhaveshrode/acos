import { RuntimeEventBus } from "./RuntimeEventBus.js";

/**
 * EventSubscriptionManager tracking unsubscribe callbacks.
 */
export class EventSubscriptionManager {
  private readonly unsubscribers: Array<() => void> = [];

  constructor(private readonly bus: RuntimeEventBus) {}

  public register(topic: string, callback: (payload: any) => Promise<void>): void {
    const unsub = this.bus.subscribe(topic, callback);
    this.unsubscribers.push(unsub);
  }

  public clear(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers.length = 0;
  }
}
