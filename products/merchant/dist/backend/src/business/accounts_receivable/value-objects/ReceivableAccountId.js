import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Receivable account identifier.
 */
export class ReceivableAccountId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new ReceivableAccountId.
     */
    static generate() {
        return new ReceivableAccountId();
    }
    /**
     * Creates a ReceivableAccountId from a string UUID representation.
     */
    static from(value) {
        return new ReceivableAccountId(value);
    }
}
