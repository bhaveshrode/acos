import { IEventBus } from "../../../foundation/events/EventBus.js";
import { RepositoryContext } from "../../repositories/base/RepositoryContext.js";
import { OutboxMessage } from "./OutboxMessage.js";
import { EventSerializer } from "../serializers/EventSerializer.js";

/**
 * Worker executing background dispatches of persisted outbox messages.
 */
export class OutboxProcessor {
  constructor(
    private readonly context: RepositoryContext,
    private readonly eventBus: IEventBus,
    private readonly maxRetries: number = 3
  ) {}

  /**
   * Resolves the primary database client (non-transactional read operations).
   */
  private get prisma() {
    return this.context.client;
  }

  /**
   * Processes all pending or failed outbox events that have not exceeded the retry limit.
   */
  public async processPending(): Promise<void> {
    try {
      const pendingMessages: OutboxMessage[] = await (this.prisma as any).outboxMessage.findMany({
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
          } as any;

          // Dispatch to underlying event bus
          await this.eventBus.publish(event);

          // Mark processed
          await (this.prisma as any).outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: "PROCESSED",
              processedAt: new Date(),
              error: null
            }
          });
        } catch (err: any) {
          // Increment retry attempt and log error
          await (this.prisma as any).outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: "FAILED",
              retryCount: msg.retryCount + 1,
              error: err.message || "Unknown error during outbox publishing"
            }
          });
        }
      }
    } catch (globalError) {
      // Suppress or bubble worker process errors
    }
  }
}
