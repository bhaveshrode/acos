import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique User identifier.
 */
export class UserId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new UserId.
     */
    static generate() {
        return new UserId();
    }
    /**
     * Creates a UserId from an existing UUID string.
     */
    static from(value) {
        return new UserId(value);
    }
}
