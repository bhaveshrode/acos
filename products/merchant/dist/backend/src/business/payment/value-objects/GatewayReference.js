import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a payment provider or gateway reference ID.
 */
export class GatewayReference extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a GatewayReference.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Gateway reference cannot be empty."));
        }
        return Result.ok(new GatewayReference({ value: value.trim() }));
    }
    get value() {
        return this.props.value;
    }
}
