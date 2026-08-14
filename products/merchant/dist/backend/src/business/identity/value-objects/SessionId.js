import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique user session identifier.
 */
export class SessionId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new SessionId.
     */
    static generate() {
        return new SessionId();
    }
    /**
     * Creates a SessionId from an existing UUID string.
     */
    static from(value) {
        return new SessionId(value);
    }
}
