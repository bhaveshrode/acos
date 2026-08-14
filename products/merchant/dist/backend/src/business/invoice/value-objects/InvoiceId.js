import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Invoice identifier.
 */
export class InvoiceId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new InvoiceId.
     */
    static generate() {
        return new InvoiceId();
    }
    /**
     * Creates an InvoiceId from a string UUID representation.
     */
    static from(value) {
        return new InvoiceId(value);
    }
}
