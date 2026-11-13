import { IEventBus, InMemoryEventBus as FoundationInMemoryEventBus } from "../../../foundation/events/EventBus.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { IEventHandler } from "../../../foundation/events/EventHandler.js";

/**
 * Concrete implementation of the infrastructure Event Bus wrapper.
 * Integrates the local foundation event bus for in-process subscriber notifications.
 */
export class InMemoryEventBus implements IEventBus {
  private readonly delegate = new FoundationInMemoryEventBus();

  public async publish(event: IDomainEvent): Promise<void> {
    await this.delegate.publish(event);
  }

  public async publishAll(events: readonly IDomainEvent[]): Promise<void> {
    await this.delegate.publishAll(events);
  }

  public subscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.delegate.subscribe(eventName, handler);
  }

  public unsubscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.delegate.unsubscribe(eventName, handler);
  }
}
