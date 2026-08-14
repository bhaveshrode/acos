import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Value Object representing a unique Settlement identifier.
 */
export class SettlementId extends UniqueEntityID {
    constructor(value) {
        super(value);
    }
    /**
     * Generates a new SettlementId.
     */
    static generate() {
        return new SettlementId();
    }
    /**
     * Creates a SettlementId from a string UUID representation.
     */
    static from(value) {
        return new SettlementId(value);
    }
}
