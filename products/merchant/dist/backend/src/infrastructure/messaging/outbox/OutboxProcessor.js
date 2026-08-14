import { EventSerializer } from "../serializers/EventSerializer.js";
/**
 * Worker executing background dispatches of persisted outbox messages.
 */
export class OutboxProcessor {
    context;
    eventBus;
    maxRetries;
    constructor(context, eventBus, maxRetries = 3) {
        this.context = context;
        this.eventBus = eventBus;
        this.maxRetries = maxRetries;
    }
    /**
     * Resolves the primary database client (non-transactional read operations).
     */
    get prisma() {
        return this.context.client;
    }
    /**
     * Processes all pending or failed outbox events that have not exceeded the retry limit.
     */
    async processPending() {
        try {
            const pendingMessages = await this.prisma.outboxMessage.findMany({
                where: {
                    OR: [
                        { status: "PENDING" },
                        {
                            status: "FAILED",
                            retryCount: { lt: this.maxRetries }
                        }
                    ]
                },
                orderBy: { createdAt: "asc" }
            });
            for (const msg of pendingMessages) {
                try {
                    const eventData = EventSerializer.deserialize(msg.payload);
                    // Rebuild event wrapper
                    const event = {
                        eventName: eventData.eventName,
                        occurredOn: new Date(eventData.occurredOn),
                        metadata: eventData.metadata,
                        getAggregateId: () => eventData.metadata.aggregateId,
                        ...eventData.payload
                    };
                    // Dispatch to underlying event bus
                    await this.eventBus.publish(event);
                    // Mark processed
                    await this.prisma.outboxMessage.update({
                        where: { id: msg.id },
                        data: {
                            status: "PROCESSED",
                            processedAt: new Date(),
                            error: null
                        }
                    });
                }
                catch (err) {
                    // Increment retry attempt and log error
                    await this.prisma.outboxMessage.update({
                        where: { id: msg.id },
                        data: {
                            status: "FAILED",
                            retryCount: msg.retryCount + 1,
                            error: err.message || "Unknown error during outbox publishing"
                        }
                    });
                }
            }
        }
        catch (globalError) {
            // Suppress or bubble worker process errors
        }
    }
}
