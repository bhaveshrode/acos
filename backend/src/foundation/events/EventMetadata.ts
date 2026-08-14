import crypto from "crypto";
import { ValueObject } from "../core/ValueObject.js";

interface EventMetadataProps {
  eventId: string;
  occurredOn: Date;
  aggregateId: string;
  aggregateType: string;
  correlationId?: string;
  causationId?: string;
}

/**
 * Value Object capturing metadata telemetry for Domain Events, supporting distributed tracing.
 */
export class EventMetadata extends ValueObject<EventMetadataProps> {
  /**
   * Creates an EventMetadata instance.
   * @param props Metadata properties. Custom eventId and occurredOn will be generated if omitted.
   */
  constructor(
    props: Omit<EventMetadataProps, "eventId" | "occurredOn"> & {
      eventId?: string;
      occurredOn?: Date;
    }
  ) {
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

  public get eventId(): string {
    return this.props.eventId;
  }

  public get occurredOn(): Date {
    return this.props.occurredOn;
  }

  public get aggregateId(): string {
    return this.props.aggregateId;
  }

  public get aggregateType(): string {
    return this.props.aggregateType;
  }

  public get correlationId(): string | undefined {
    return this.props.correlationId;
  }

  public get causationId(): string | undefined {
    return this.props.causationId;
  }
}
