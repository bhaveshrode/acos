import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a validated geographical timezone (e.g. UTC, Europe/London).
 */
export class TimeZone extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates and validates a TimeZone.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("TimeZone cannot be empty."));
        }
        const trimmed = value.trim();
        try {
            // Use built-in JavaScript engine check
            Intl.DateTimeFormat(undefined, { timeZone: trimmed });
        }
        catch (e) {
            const validFallbacks = ["UTC", "GMT", "EST", "PST", "MST", "CST"];
            if (!validFallbacks.includes(trimmed.toUpperCase())) {
                return Result.fail(ResultError.validation(`Invalid timezone identifier: '${value}'`));
            }
        }
        return Result.ok(new TimeZone({ value: trimmed }));
    }
    get value() {
        return this.props.value;
    }
}
