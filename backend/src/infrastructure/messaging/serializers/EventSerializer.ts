import { IDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Utility converting business events to and from transport-friendly JSON strings.
 */
export class EventSerializer {
  /**
   * Serializes a domain event into a JSON string.
   */
  public static serialize(event: IDomainEvent): string {
    const { eventName, metadata, occurredOn, ...rest } = event as any;
    return JSON.stringify({
      eventName: event.eventName,
      metadata: {
        eventId: event.metadata.eventId,
        occurredOn: event.metadata.occurredOn,
        aggregateId: event.metadata.aggregateId,
        aggregateType: event.metadata.aggregateType,
        correlationId: event.metadata.correlationId,
        causationId: event.metadata.causationId
      },
      occurredOn: event.occurredOn.toISOString(),
      payload: rest
    });
  }

  /**
   * Deserializes a JSON string into a raw javascript object.
   */
  public static deserialize<T = any>(json: string): T {
    return JSON.parse(json);
  }
}
