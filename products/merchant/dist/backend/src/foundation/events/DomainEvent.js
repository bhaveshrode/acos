import { EventMetadata } from "./EventMetadata.js";
/**
 * Base abstract class implementing IDomainEvent.
 * Reduces boilerplate for concrete domain events by automatically generating metadata.
 */
export class BaseDomainEvent {
    eventName;
    metadata;
    /**
     * Creates a BaseDomainEvent.
     * @param aggregateId Unique identity of the source aggregate root.
     * @param aggregateType String representation of the aggregate class (e.g. 'Invoice').
     * @param eventName Optional custom event identifier name. Defaults to the subclass name.
     */
    constructor(aggregateId, aggregateType, eventName) {
        this.eventName = eventName || this.constructor.name;
        this.metadata = new EventMetadata({
            aggregateId,
            aggregateType
        });
    }
    /**
     * Retrieves the timestamp when the event occurred.
     */
    get occurredOn() {
        return this.metadata.occurredOn;
    }
    /**
     * Retrieves the source aggregate identity string.
     */
    getAggregateId() {
        return this.metadata.aggregateId;
    }
}
