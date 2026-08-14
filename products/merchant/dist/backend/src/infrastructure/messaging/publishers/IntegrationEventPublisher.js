/**
 * Publisher responsible for transporting events targeted at external systems or cross-boundary contexts.
 */
export class IntegrationEventPublisher {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /**
     * Publishes an integration event.
     */
    async publish(event) {
        // In-memory local bus forwarding for inter-module integration flow
        await this.eventBus.publish(event);
    }
}
