import { IDomainEvent } from "./DomainEvent.js";
import { IEventHandler } from "./EventHandler.js";
import { EventRegistry } from "./EventRegistry.js";
import { EventDispatcher } from "./EventDispatcher.js";

/**
 * Interface representing the Event Bus abstraction in ACOS.
 * Allows components to publish domain events and subscribe handlers.
 */
export interface IEventBus {
  /**
   * Publishes a single domain event to the bus.
   * @param event The event to publish.
   */
  publish(event: IDomainEvent): Promise<void>;

  /**
   * Publishes a list of domain events sequentially.
   * @param events The events array.
   */
  publishAll(events: readonly IDomainEvent[]): Promise<void>;

  /**
   * Subscribes an event handler to a specific event type.
   * @param eventName The event name.
   * @param handler The subscriber handler.
   */
  subscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void;

  /**
   * Unsubscribes an event handler from a specific event type.
   * @param eventName The event name.
   * @param handler The subscriber handler.
   */
  unsubscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void;
}

/**
 * In-Memory Event Bus implementation for local development and testing.
 * Composes EventRegistry and EventDispatcher to orchestrate message delivery in-process.
 */
export class InMemoryEventBus implements IEventBus {
  private readonly registry: EventRegistry;
  private readonly dispatcher: EventDispatcher;

  constructor() {
    this.registry = new EventRegistry();
    this.dispatcher = new EventDispatcher(this.registry);
  }

  /**
   * Publishes a single domain event.
   */
  public async publish(event: IDomainEvent): Promise<void> {
    await this.dispatcher.dispatch(event);
  }

  /**
   * Publishes all domain events sequentially to preserve ordering.
   */
  public async publishAll(events: readonly IDomainEvent[]): Promise<void> {
    await this.dispatcher.dispatchAll(events);
  }

  /**
   * Subscribes a handler to an event.
   */
  public subscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.registry.register(eventName, handler);
  }

  /**
   * Unsubscribes a handler from an event.
   */
  public unsubscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.registry.unregister(eventName, handler);
  }
}
