import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Customer identifier.
 */
export class CustomerId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new CustomerId.
     */
    static generate() {
        return new CustomerId();
    }
    /**
     * Creates a CustomerId from a string UUID representation.
     */
    static from(value) {
        return new CustomerId(value);
    }
}
