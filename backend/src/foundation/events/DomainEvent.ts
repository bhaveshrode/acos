import { EventMetadata } from "./EventMetadata.js";

/**
 * Interface representing a Domain Event in ACOS.
 * All domain events must implement this interface.
 */
export interface IDomainEvent {
  /**
   * Unique identifier name representing the event type (e.g. 'acos.invoice.created').
   */
  readonly eventName: string;

  /**
   * The metadata telemetry wrapping the event.
   */
  readonly metadata: EventMetadata;

  /**
   * The date and time when the event occurred.
   */
  readonly occurredOn: Date;

  /**
   * Returns the identifier of the aggregate that generated this event.
   */
  getAggregateId(): string;
}

/**
 * Base abstract class implementing IDomainEvent.
 * Reduces boilerplate for concrete domain events by automatically generating metadata.
 */
export abstract class BaseDomainEvent implements IDomainEvent {
  public readonly eventName: string;
  public readonly metadata: EventMetadata;

  /**
   * Creates a BaseDomainEvent.
   * @param aggregateId Unique identity of the source aggregate root.
   * @param aggregateType String representation of the aggregate class (e.g. 'Invoice').
   * @param eventName Optional custom event identifier name. Defaults to the subclass name.
   */
  protected constructor(
    aggregateId: string,
    aggregateType: string,
    eventName?: string
  ) {
    this.eventName = eventName || this.constructor.name;
    this.metadata = new EventMetadata({
      aggregateId,
      aggregateType
    });
  }

  /**
   * Retrieves the timestamp when the event occurred.
   */
  public get occurredOn(): Date {
    return this.metadata.occurredOn;
  }

  /**
   * Retrieves the source aggregate identity string.
   */
  public getAggregateId(): string {
    return this.metadata.aggregateId;
  }
}
