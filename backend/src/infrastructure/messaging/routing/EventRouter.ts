import { IEventBus } from "../../../foundation/events/EventBus.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Message router routing dynamic payloads to targeted subscribers.
 */
export class EventRouter {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Routes a message payload by publishing it directly to the local event pipeline.
   */
  public async route(event: IDomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }
}
