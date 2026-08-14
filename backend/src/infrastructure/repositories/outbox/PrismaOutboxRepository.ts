import { BaseRepository } from "../base/BaseRepository.js";
import { IOutboxRepository } from "../../../foundation/events/IOutboxRepository.js";
import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { EventSerializer } from "../../../foundation/events/EventSerializer.js";

/**
 * Concrete Prisma-backed implementation of the durable transactional Outbox repository.
 */
export class PrismaOutboxRepository extends BaseRepository implements IOutboxRepository {
  /**
   * Persists a serialized domain event to the database.
   */
  public async save(event: IDomainEvent): Promise<void> {
    const payload = EventSerializer.serialize(event);
    await (this.prisma as any).outboxEvent.create({
      data: {
        eventType: event.eventName,
        payload
      }
    });
  }

  /**
   * Fetches unprocessed outbox events, ordered chronologically.
   */
  public async fetchUnprocessed(): Promise<Array<{ id: string; eventType: string; payload: string }>> {
    return await (this.prisma as any).outboxEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: "asc" }
    });
  }

  /**
   * Marks a specific outbox event as processed in the database.
   */
  public async markAsProcessed(id: string): Promise<void> {
    await (this.prisma as any).outboxEvent.update({
      where: { id },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });
  }
}
