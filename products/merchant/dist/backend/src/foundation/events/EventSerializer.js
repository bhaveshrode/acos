import { EventMetadata } from "./EventMetadata.js";
/**
 * Platform-level Utility to serialize and hydrate domain events in ACOS.
 * Ensures that enqueued database outbox events regain their original class prototype
 * and method behaviors (such as getAggregateId()) upon deserialization.
 */
export class EventSerializer {
    static eventRegistry = new Map();
    /**
     * Registers a domain event class for hydration.
     * @param eventName Unique name of the event (typically matching record.eventType).
     * @param constructor Class constructor for the domain event.
     */
    static register(eventName, constructor) {
        if (!eventName) {
            throw new Error("EventSerializer: eventName cannot be empty.");
        }
        if (!constructor) {
            throw new Error("EventSerializer: constructor cannot be null.");
        }
        this.eventRegistry.set(eventName, constructor);
    }
    /**
     * Serializes a domain event into a plain JSON string.
     */
    static serialize(event) {
        if (!event) {
            throw new Error("EventSerializer: event to serialize cannot be null.");
        }
        return JSON.stringify({
            ...event,
            eventName: event.eventName,
            occurredOn: event.occurredOn
        });
    }
    /**
     * Hydrates a JSON payload string back into a rich domain event instance.
     */
    static deserialize(eventName, payloadStr) {
        if (!eventName) {
            throw new Error("EventSerializer: eventName is required for deserialization.");
        }
        if (!payloadStr) {
            throw new Error("EventSerializer: payload string is required for deserialization.");
        }
        const rawData = JSON.parse(payloadStr);
        const constructor = this.eventRegistry.get(eventName);
        let eventInstance;
        if (constructor) {
            const rawDataCopy = { ...rawData };
            delete rawDataCopy.occurredOn;
            delete rawDataCopy.eventName;
            // Reconstruct domain event class prototype
            eventInstance = Object.create(constructor.prototype);
            Object.assign(eventInstance, rawDataCopy);
        }
        else {
            // Fallback: Bind dynamic getAggregateId if not registered
            eventInstance = {
                ...rawData,
                getAggregateId() {
                    return this.metadata?.aggregateId || "";
                }
            };
            if (rawData.occurredOn) {
                eventInstance.occurredOn = new Date(rawData.occurredOn);
            }
        }
        // Standardize event name field
        eventInstance.eventName = eventName;
        // Hydrate EventMetadata value object if present
        if (rawData.metadata) {
            const metadataInstance = Object.create(EventMetadata.prototype);
            // Reconstruct the internal ValueObject props dictionary
            const metadataProps = rawData.metadata.props || rawData.metadata;
            Object.assign(metadataInstance, {
                props: {
                    ...metadataProps,
                    occurredOn: metadataProps.occurredOn ? new Date(metadataProps.occurredOn) : new Date()
                }
            });
            eventInstance.metadata = metadataInstance;
        }
        return eventInstance;
    }
    /**
     * Clears the event constructor registry.
     */
    static clearRegistry() {
        this.eventRegistry.clear();
    }
}
