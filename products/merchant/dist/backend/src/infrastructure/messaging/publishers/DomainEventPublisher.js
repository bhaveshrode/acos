/**
 * Publisher responsible for dispatching internal business domain events to the Event Bus.
 */
export class DomainEventPublisher {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /**
     * Publishes a single domain event.
     */
    async publish(event) {
        await this.eventBus.publish(event);
    }
    /**
     * Publishes a collection of domain events sequentially.
     */
    async publishAll(events) {
        await this.eventBus.publishAll(events);
    }
}
