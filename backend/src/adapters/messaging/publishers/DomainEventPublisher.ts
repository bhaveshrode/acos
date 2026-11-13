import { IEventBus } from "../../../foundation/events/EventBus.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Publisher responsible for dispatching internal business domain events to the Event Bus.
 */
export class DomainEventPublisher {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Publishes a single domain event.
   */
  public async publish(event: IDomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }

  /**
   * Publishes a collection of domain events sequentially.
   */
  public async publishAll(events: readonly IDomainEvent[]): Promise<void> {
    await this.eventBus.publishAll(events);
  }
}
