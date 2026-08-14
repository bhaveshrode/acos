import crypto from "crypto";
import { ValueObject } from "./ValueObject.js";
/**
 * Base abstract Identifier class extending ValueObject.
 * Provides strongly typed, immutable identities.
 */
export class Identifier extends ValueObject {
    /**
     * Creates a new Identifier instance.
     * @param value The primitive identifier value.
     */
    constructor(value) {
        if (value === null || value === undefined) {
            throw new Error("Identifier value cannot be null or undefined.");
        }
        if (typeof value === "string" && value.trim() === "") {
            throw new Error("Identifier value cannot be empty.");
        }
        super({ value });
    }
    /**
     * Retrieves the raw primitive value of the identifier.
     */
    get value() {
        return this.props.value;
    }
    /**
     * Converts the identifier to its string representation.
     */
    toString() {
        return String(this.value);
    }
    /**
     * Serializes the identifier as its raw primitive value when converted to JSON.
     */
    toJSON() {
        return this.value;
    }
}
// Standard UUID regex (v1-v5 compliant)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Concrete UUID-backed Identifier.
 * Automatically generates a new UUID v4 if no value is provided.
 */
export class UniqueEntityID extends Identifier {
    /**
     * Creates a UniqueEntityID.
     * Generates a new UUID v4 if value is omitted.
     * @param value Optional existing UUID string.
     */
    constructor(value) {
        let actualValue;
        if (!value) {
            actualValue = crypto.randomUUID();
        }
        else if (typeof value === "string") {
            actualValue = value;
        }
        else if (typeof value === "object" && value !== null) {
            actualValue = typeof value.value === "string" ? value.value : String(value);
        }
        else {
            actualValue = String(value);
        }
        super(actualValue);
        if (!UUID_REGEX.test(this.value)) {
            throw new Error("Invalid UUID format.");
        }
    }
    /**
     * Factory method to generate a new UniqueEntityID.
     */
    static generate() {
        return new UniqueEntityID();
    }
    /**
     * Factory method to create a UniqueEntityID from an existing value.
     * @param value The existing UUID string.
     */
    static from(value) {
        return new UniqueEntityID(value);
    }
}
