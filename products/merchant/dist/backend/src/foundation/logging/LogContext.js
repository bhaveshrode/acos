import { ValueObject } from "../core/ValueObject.js";
/**
 * Value Object capturing operational context context and tracing correlation details for logs.
 */
export class LogContext extends ValueObject {
    constructor(props = {}) {
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
    get correlationId() {
        return this.props.correlationId;
    }
    get causationId() {
        return this.props.causationId;
    }
    get traceId() {
        return this.props.traceId;
    }
    get spanId() {
        return this.props.spanId;
    }
    get userId() {
        return this.props.userId;
    }
    get moduleName() {
        return this.props.moduleName;
    }
    get additionalData() {
        return this.props.additionalData;
    }
    /**
     * Static helper to create a blank context.
     */
    static empty() {
        return new LogContext();
    }
    /**
     * Merges another context into a new merged LogContext instance, maintaining immutability.
     * @param other Context details or LogContext object to merge.
     */
    merge(other) {
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
