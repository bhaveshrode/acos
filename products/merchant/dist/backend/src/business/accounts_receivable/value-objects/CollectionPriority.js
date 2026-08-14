import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a collection action priority level.
 */
export class CollectionPriority extends ValueObject {
    static LOW = "LOW";
    static MEDIUM = "MEDIUM";
    static HIGH = "HIGH";
    static CRITICAL = "CRITICAL";
    constructor(props) {
        super(props);
    }
    /**
     * Creates a CollectionPriority.
     */
    static create(value) {
        const formatted = value.toUpperCase().trim();
        const valid = [
            CollectionPriority.LOW,
            CollectionPriority.MEDIUM,
            CollectionPriority.HIGH,
            CollectionPriority.CRITICAL
        ];
        if (!valid.includes(formatted)) {
            return Result.fail(ResultError.validation(`Invalid collection priority: ${value}.`));
        }
        return Result.ok(new CollectionPriority({ value: formatted }));
    }
    get value() {
        return this.props.value;
    }
}
