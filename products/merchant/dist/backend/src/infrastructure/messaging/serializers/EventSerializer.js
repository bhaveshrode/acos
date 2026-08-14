/**
 * Utility converting business events to and from transport-friendly JSON strings.
 */
export class EventSerializer {
    /**
     * Serializes a domain event into a JSON string.
     */
    static serialize(event) {
        const { eventName, metadata, occurredOn, ...rest } = event;
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
    static deserialize(json) {
        return JSON.parse(json);
    }
}
