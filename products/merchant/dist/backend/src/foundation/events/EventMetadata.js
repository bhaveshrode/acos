import crypto from "crypto";
import { ValueObject } from "../core/ValueObject.js";
/**
 * Value Object capturing metadata telemetry for Domain Events, supporting distributed tracing.
 */
export class EventMetadata extends ValueObject {
    /**
     * Creates an EventMetadata instance.
     * @param props Metadata properties. Custom eventId and occurredOn will be generated if omitted.
     */
    constructor(props) {
        if (!props.aggregateId || props.aggregateId.trim() === "") {
            throw new Error("EventMetadata aggregateId cannot be null or empty.");
        }
        if (!props.aggregateType || props.aggregateType.trim() === "") {
            throw new Error("EventMetadata aggregateType cannot be null or empty.");
        }
        super({
            eventId: props.eventId || crypto.randomUUID(),
            occurredOn: props.occurredOn || new Date(),
            aggregateId: props.aggregateId.trim(),
            aggregateType: props.aggregateType.trim(),
            correlationId: props.correlationId ? props.correlationId.trim() : undefined,
            causationId: props.causationId ? props.causationId.trim() : undefined
        });
    }
    get eventId() {
        return this.props.eventId;
    }
    get occurredOn() {
        return this.props.occurredOn;
    }
    get aggregateId() {
        return this.props.aggregateId;
    }
    get aggregateType() {
        return this.props.aggregateType;
    }
    get correlationId() {
        return this.props.correlationId;
    }
    get causationId() {
        return this.props.causationId;
    }
}
