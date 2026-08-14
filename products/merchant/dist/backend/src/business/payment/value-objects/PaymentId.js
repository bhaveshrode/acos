import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Payment identifier.
 */
export class PaymentId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new PaymentId.
     */
    static generate() {
        return new PaymentId();
    }
    /**
     * Creates a PaymentId from a string UUID representation.
     */
    static from(value) {
        return new PaymentId(value);
    }
}
