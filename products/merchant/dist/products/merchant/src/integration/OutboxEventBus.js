/**
 * Custom Event Bus implementation that implements the durable Transactional Outbox pattern.
 * Saves domain events to the OutboxEvent table in the database before asynchronous dispatching.
 */
export class OutboxEventBus {
    underlyingBus;
    boundary;
    constructor(underlyingBus, boundary) {
        this.underlyingBus = underlyingBus;
        this.boundary = boundary;
    }
    async publish(event) {
        const prisma = this.boundary.prismaClient;
        if (prisma) {
            const eventName = event.eventName || (event.constructor.name !== "Object" ? event.constructor.name : "") || "DomainEvent";
            const payload = JSON.stringify(event);
            try {
                await prisma.outboxEvent.create({
                    data: {
                        eventType: eventName,
                        payload,
                        processed: false
                    }
                });
                // Process outbox asynchronously in the background
                this.boundary.processOutboxAsynchronously();
            }
            catch (err) {
                // Fallback to direct publishing on DB error to prevent blocking execution
                await this.underlyingBus.publish(event);
            }
        }
        else {
            await this.underlyingBus.publish(event);
        }
    }
    async publishAll(events) {
        for (const event of events) {
            await this.publish(event);
        }
    }
    subscribe(eventName, handler) {
        this.underlyingBus.subscribe(eventName, handler);
    }
    unsubscribe(eventName, handler) {
        this.underlyingBus.unsubscribe(eventName, handler);
    }
}
