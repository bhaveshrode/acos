import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a blockchain transaction hash.
 * Enforces basic structure formatting and hex length validations.
 */
export class TransactionHash extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a TransactionHash.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Transaction hash cannot be empty."));
        }
        const clean = value.trim();
        if (clean.startsWith("0x")) {
            // Basic 64 hex character blockchain transaction signature check
            const pattern = /^0x([A-Fa-f0-9]{64})$/;
            if (!pattern.test(clean)) {
                return Result.fail(ResultError.validation("Invalid EVM transaction hash format. Must be 0x followed by 64 hex chars."));
            }
        }
        return Result.ok(new TransactionHash({ value: clean }));
    }
    get value() {
        return this.props.value;
    }
}
