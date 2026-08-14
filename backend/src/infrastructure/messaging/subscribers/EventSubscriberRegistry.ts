import { IEventBus } from "../../../foundation/events/EventBus.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { IEventHandler } from "../../../foundation/events/EventHandler.js";

/**
 * Registry coordinating the subscription and unsubscription of event handlers.
 */
export class EventSubscriberRegistry {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Registers a handler to receive published events of a given name.
   */
  public register<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.eventBus.subscribe(eventName, handler);
  }

  /**
   * Unregisters a handler from receiving events of a given name.
   */
  public unregister<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.eventBus.unsubscribe(eventName, handler);
  }
}
