import { InMemoryEventBus } from "../event-bus/InMemoryEventBus.js";
import { DomainEventPublisher } from "../publishers/DomainEventPublisher.js";
import { IntegrationEventPublisher } from "../publishers/IntegrationEventPublisher.js";
import { EventSubscriberRegistry } from "../subscribers/EventSubscriberRegistry.js";
import { OutboxService } from "../outbox/OutboxService.js";
import { OutboxProcessor } from "../outbox/OutboxProcessor.js";
/**
 * Factory class coordinating creation of local event buses, publishers, and workers.
 */
export class MessagingFactory {
    static localBus = null;
    /**
     * Retrieves the singleton Event Bus instance.
     */
    static getEventBus() {
        if (!this.localBus) {
            this.localBus = new InMemoryEventBus();
        }
        return this.localBus;
    }
    /**
     * Instantiates a new DomainEventPublisher.
     */
    static createDomainPublisher(eventBus = this.getEventBus()) {
        return new DomainEventPublisher(eventBus);
    }
    /**
     * Instantiates a new IntegrationEventPublisher.
     */
    static createIntegrationPublisher(eventBus = this.getEventBus()) {
        return new IntegrationEventPublisher(eventBus);
    }
    /**
     * Instantiates a new EventSubscriberRegistry.
     */
    static createSubscriberRegistry(eventBus = this.getEventBus()) {
        return new EventSubscriberRegistry(eventBus);
    }
    /**
     * Instantiates a new OutboxService.
     */
    static createOutboxService(context) {
        return new OutboxService(context);
    }
    /**
     * Instantiates a new OutboxProcessor.
     */
    static createOutboxProcessor(context, eventBus = this.getEventBus()) {
        return new OutboxProcessor(context, eventBus);
    }
}
