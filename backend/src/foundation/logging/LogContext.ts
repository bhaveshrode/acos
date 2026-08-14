import { ValueObject } from "../core/ValueObject.js";

interface LogContextProps {
  correlationId?: string;
  causationId?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  moduleName?: string;
  additionalData?: Record<string, any>;
}

/**
 * Value Object capturing operational context context and tracing correlation details for logs.
 */
export class LogContext extends ValueObject<LogContextProps> {
  constructor(props: LogContextProps = {}) {
    super({
      correlationId: props.correlationId,
      causationId: props.causationId,
      traceId: props.traceId,
      spanId: props.spanId,
      userId: props.userId,
      moduleName: props.moduleName,
      additionalData: props.additionalData ? Object.freeze({ ...props.additionalData }) : undefined
    });
  }

  public get correlationId(): string | undefined {
    return this.props.correlationId;
  }

  public get causationId(): string | undefined {
    return this.props.causationId;
  }

  public get traceId(): string | undefined {
    return this.props.traceId;
  }

  public get spanId(): string | undefined {
    return this.props.spanId;
  }

  public get userId(): string | undefined {
    return this.props.userId;
  }

  public get moduleName(): string | undefined {
    return this.props.moduleName;
  }

  public get additionalData(): Record<string, any> | undefined {
    return this.props.additionalData;
  }

  /**
   * Static helper to create a blank context.
   */
  public static empty(): LogContext {
    return new LogContext();
  }

  /**
   * Merges another context into a new merged LogContext instance, maintaining immutability.
   * @param other Context details or LogContext object to merge.
   */
  public merge(other: LogContextProps | LogContext): LogContext {
    const otherProps = other instanceof LogContext ? other.props : other;
    return new LogContext({
      correlationId: otherProps.correlationId !== undefined ? otherProps.correlationId : this.props.correlationId,
      causationId: otherProps.causationId !== undefined ? otherProps.causationId : this.props.causationId,
      traceId: otherProps.traceId !== undefined ? otherProps.traceId : this.props.traceId,
      spanId: otherProps.spanId !== undefined ? otherProps.spanId : this.props.spanId,
      userId: otherProps.userId !== undefined ? otherProps.userId : this.props.userId,
      moduleName: otherProps.moduleName !== undefined ? otherProps.moduleName : this.props.moduleName,
      additionalData: {
        ...this.props.additionalData,
        ...otherProps.additionalData
      }
    });
  }
}
