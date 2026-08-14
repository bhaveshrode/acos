import { IEventBus } from "../../../foundation/events/EventBus.js";
import { InMemoryEventBus } from "../event-bus/InMemoryEventBus.js";
import { DomainEventPublisher } from "../publishers/DomainEventPublisher.js";
import { IntegrationEventPublisher } from "../publishers/IntegrationEventPublisher.js";
import { EventSubscriberRegistry } from "../subscribers/EventSubscriberRegistry.js";
import { OutboxService } from "../outbox/OutboxService.js";
import { OutboxProcessor } from "../outbox/OutboxProcessor.js";
import { RepositoryContext } from "../../repositories/base/RepositoryContext.js";

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

  /**
   * Instantiates a new OutboxService.
   */
  public static createOutboxService(context: RepositoryContext): OutboxService {
    return new OutboxService(context);
  }

  /**
   * Instantiates a new OutboxProcessor.
   */
  public static createOutboxProcessor(
    context: RepositoryContext,
    eventBus: IEventBus = this.getEventBus()
  ): OutboxProcessor {
    return new OutboxProcessor(context, eventBus);
  }
}
