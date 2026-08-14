import { IDomainEvent } from "./DomainEvent.js";
import { EventRegistry } from "./EventRegistry.js";

/**
 * Dispatcher class responsible for routing published events to their registered handlers.
 * Ensures all subscribers are executed, collecting any errors.
 */
export class EventDispatcher {
  constructor(private readonly registry: EventRegistry) {
    if (!registry) {
      throw new Error("EventRegistry must be provided to EventDispatcher.");
    }
  }

  /**
   * Dispatches a single domain event to all its registered handlers.
   * Runs all handlers concurrently. Utilizes Promise.allSettled to ensure that
   * a failure in one handler does not abort the execution of other subscribers.
   * @param event The domain event instance to dispatch.
   */
  public async dispatch(event: IDomainEvent): Promise<void> {
    if (!event) return;

    const handlers = this.registry.getHandlersFor(event.eventName);
    if (handlers.length === 0) {
      return;
    }

    const promises = handlers.map(async (handler) => {
      await handler.handle(event);
    });

    const results = await Promise.allSettled(promises);
    
    // Check if any handler execution failed, and aggregate errors if so
    const failures = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    if (failures.length > 0) {
      const messages = failures.map((f) => String(f.reason?.message || f.reason)).join("; ");
      throw new Error(`Event dispatch failed for ${event.eventName}: [${messages}]`);
    }
  }

  /**
   * Dispatches an array of domain events sequentially.
   * Sequential execution is critical to preserve logical domain event ordering.
   * @param events The array of events to dispatch.
   */
  public async dispatchAll(events: readonly IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
