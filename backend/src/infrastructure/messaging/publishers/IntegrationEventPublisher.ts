import { IEventBus } from "../../../foundation/events/EventBus.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Publisher responsible for transporting events targeted at external systems or cross-boundary contexts.
 */
export class IntegrationEventPublisher {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Publishes an integration event.
   */
  public async publish(event: IDomainEvent): Promise<void> {
    // In-memory local bus forwarding for inter-module integration flow
    await this.eventBus.publish(event);
  }
}
