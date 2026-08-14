export interface CorrelationProps {
  eventId: string;
  correlationId: string;
  causationId: string;
}

export class CorrelationContext {
  constructor(public readonly props: CorrelationProps) {
    Object.freeze(this.props);
    Object.freeze(this);
  }

  public static create(eventId: string, correlationId?: string, causationId?: string): CorrelationContext {
    return new CorrelationContext({
      eventId,
      correlationId: correlationId || eventId,
      causationId: causationId || eventId
    });
  }

  public deriveNext(nextEventId: string): CorrelationContext {
    return new CorrelationContext({
      eventId: nextEventId,
      correlationId: this.props.correlationId,
      causationId: this.props.eventId // Direct causation link
    });
  }
}
