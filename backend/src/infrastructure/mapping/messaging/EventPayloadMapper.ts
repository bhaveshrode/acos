import { MapperBase } from "../common/MapperBase.js";

export interface DomainEvent {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  data: any;
}

export interface OutboxLogEntry {
  messageId: string;
  messageType: string;
  payloadJson: string;
  occurredAt: Date;
}

/**
 * Mapper converting Domain events into serialized JSON Outbox logs.
 */
export class EventPayloadMapper extends MapperBase<DomainEvent, OutboxLogEntry> {
  public map(source: DomainEvent): OutboxLogEntry {
    return {
      messageId: source.eventId,
      messageType: source.eventType,
      payloadJson: JSON.stringify(source.data),
      occurredAt: source.occurredAt
    };
  }
}
