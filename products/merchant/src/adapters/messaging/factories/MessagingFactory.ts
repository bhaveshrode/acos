import type { IEventBus } from "acos-backend";
import { InMemoryEventBus } from "../event-bus/InMemoryEventBus.js";
import { DomainEventPublisher } from "../publishers/DomainEventPublisher.js";
import { IntegrationEventPublisher } from "../publishers/IntegrationEventPublisher.js";
import { EventSubscriberRegistry } from "../subscribers/EventSubscriberRegistry.js";

/**
 * Factory class coordinating creation of local event buses, publishers, and workers.
 */
export class MessagingFactory {
  private static localBus: IEventBus | null = null;

  /**
   * Retrieves the singleton Event Bus instance.
   */
  public static getEventBus(): IEventBus {
    if (!this.localBus) {
      this.localBus = new InMemoryEventBus();
    }
    return this.localBus;
  }

  /**
   * Instantiates a new DomainEventPublisher.
   */
  public static createDomainPublisher(
    eventBus: IEventBus = this.getEventBus()
  ): DomainEventPublisher {
    return new DomainEventPublisher(eventBus);
  }

  /**
   * Instantiates a new IntegrationEventPublisher.
   */
  public static createIntegrationPublisher(
    eventBus: IEventBus = this.getEventBus()
  ): IntegrationEventPublisher {
    return new IntegrationEventPublisher(eventBus);
  }

  /**
   * Instantiates a new EventSubscriberRegistry.
   */
  public static createSubscriberRegistry(
    eventBus: IEventBus = this.getEventBus()
  ): EventSubscriberRegistry {
    return new EventSubscriberRegistry(eventBus);
  }
}
