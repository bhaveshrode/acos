import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Organization identifier.
 */
export class OrganizationId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new OrganizationId.
     */
    static generate() {
        return new OrganizationId();
    }
    /**
     * Creates an OrganizationId from an existing UUID string.
     */
    static from(value) {
        return new OrganizationId(value);
    }
}
