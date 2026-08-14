import { EventSerializer } from "acos-backend/foundation/events/EventSerializer.js";
/**
 * Reusable runtime background daemon that polls the transactional outbox table,
 * hydrates stored payloads into rich Domain Event instances using the EventSerializer,
 * and dispatches them asynchronously through the primary Event Bus.
 */
export class OutboxWorker {
    repository;
    eventBus;
    intervalMs;
    intervalId = null;
    isProcessing = false;
    logger;
    constructor(repository, eventBus, loggerInstance, intervalMs = 5000) {
        this.repository = repository;
        this.eventBus = eventBus;
        this.intervalMs = intervalMs;
        this.logger = loggerInstance;
    }
    /**
     * Starts the background outbox processing daemon.
     */
    start() {
        if (this.intervalId)
            return;
        this.intervalId = setInterval(() => this.processOutbox(), this.intervalMs);
    }
    /**
     * Stops the background outbox processing daemon.
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Performs a single outbox polling and dispatching cycle.
     */
    async processOutbox() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            const records = await this.repository.fetchUnprocessed();
            for (const record of records) {
                const domainEvent = EventSerializer.deserialize(record.eventType, record.payload);
                await this.eventBus.publish(domainEvent);
                await this.repository.markAsProcessed(record.id);
            }
        }
        catch (err) {
            this.logger.error("OutboxWorker: Failed to process transactional outbox events", err);
        }
        finally {
            this.isProcessing = false;
        }
    }
}
