import { EventSerializer, IEventBus, IDomainEvent, IEventHandler } from "acos-backend";
import { AcosIntegrationBoundary } from "./AcosIntegrationBoundary.js";

/**
 * Event bus adapter writing domain events to the durable OutboxEvent table
 * before they are dispatched to the in-process bus.
 *
 * The insert runs on the caller's transaction client, so an event enqueued
 * while a command is in flight commits or rolls back with the aggregate write.
 * There is no direct-publish fallback: losing an event silently is worse than
 * failing the command.
 */
export class OutboxEventBus implements IEventBus {
  constructor(
    public readonly underlyingBus: IEventBus,
    private readonly boundary: AcosIntegrationBoundary
  ) {}

  public async publish(event: IDomainEvent): Promise<void> {
    const db = this.boundary.dbClient;
    if (!db) {
      await this.underlyingBus.publish(event);
      return;
    }

    const eventName = event.eventName || (event.constructor.name !== "Object" ? event.constructor.name : "") || "DomainEvent";

    try {
      await db.outboxEvent.create({
        data: {
          eventId: event.metadata?.eventId ?? null,
          eventType: eventName,
          aggregateId: event.getAggregateId?.() ?? null,
          payload: EventSerializer.serialize(event),
          processed: false
        }
      });
    } catch (err: any) {
      throw new Error(`Failed to enqueue domain event ${eventName}: ${err.message}`);
    }

    await this.boundary.requestOutboxDrain();
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
