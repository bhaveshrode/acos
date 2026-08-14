import { IEventBus } from "acos-backend/foundation/events/EventBus.js";
import { IDomainEvent } from "acos-backend/foundation/events/DomainEvent.js";
import { IEventHandler } from "acos-backend/foundation/events/EventHandler.js";
import { AcosIntegrationBoundary } from "./AcosIntegrationBoundary.js";

/**
 * Custom Event Bus implementation that implements the durable Transactional Outbox pattern.
 * Saves domain events to the OutboxEvent table in the database before asynchronous dispatching.
 */
export class OutboxEventBus implements IEventBus {
  constructor(
    public readonly underlyingBus: IEventBus,
    private readonly boundary: AcosIntegrationBoundary
  ) {}

  public async publish(event: IDomainEvent): Promise<void> {
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
      } catch (err: any) {
        // Fallback to direct publishing on DB error to prevent blocking execution
        await this.underlyingBus.publish(event);
      }
    } else {
      await this.underlyingBus.publish(event);
    }
  }

  public async publishAll(events: readonly IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public subscribe<T extends IDomainEvent>(eventName: string, handler: IEventHandler<T>): void {
    this.underlyingBus.subscribe(eventName, handler);
  }

  public unsubscribe<T extends IDomainEvent>(eventName: string, handler: IEventHandler<T>): void {
    this.underlyingBus.unsubscribe(eventName, handler);
  }
}
