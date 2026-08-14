import { TransactionScope } from "../../transactions/scopes/TransactionScope.js";
import { EventSerializer } from "../serializers/EventSerializer.js";
import crypto from "crypto";
/**
 * Service capturing and appending domain events to the database outbox log table.
 */
export class OutboxService {
    context;
    constructor(context) {
        this.context = context;
    }
    /**
     * Resolves the active transactional database client if inside a transaction scope.
     */
    get prisma() {
        return TransactionScope.current ?? this.context.client;
    }
    /**
     * Appends an event to the outbox message logs.
     * Runs atomically under the ambient transaction if active.
     */
    async save(event) {
        const payload = EventSerializer.serialize(event);
        const messageId = crypto.randomUUID();
        const data = {
            id: messageId,
            eventType: event.eventName,
            payload,
            status: "PENDING",
            retryCount: 0,
            createdAt: event.occurredOn || new Date(),
            processedAt: null,
            error: null
        };
        await this.prisma.outboxMessage.create({
            data
        });
    }
}
