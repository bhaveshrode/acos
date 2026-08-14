import { ObjectUtils } from "../utils/ObjectUtils.js";
/**
 * Class representing a standardized Domain Error in ACOS.
 * Replaces raw string errors to support code categories, localization, and rich metadata.
 */
export class ResultError {
    code;
    message;
    metadata;
    /**
     * Creates a new ResultError instance.
     * Enforces immutability by freezing the error instance and metadata.
     * @param code A unique uppercase category code (e.g. 'VALIDATION_ERROR').
     * @param message A human-readable error description.
     * @param metadata Optional additional key-value context.
     */
    constructor(code, message, metadata) {
        if (!code || code.trim() === "") {
            throw new Error("ResultError code cannot be null or empty.");
        }
        if (!message || message.trim() === "") {
            throw new Error("ResultError message cannot be null or empty.");
        }
        this.code = code.trim().toUpperCase();
        this.message = message.trim();
        if (metadata) {
            this.metadata = ObjectUtils.deepFreeze({ ...metadata });
        }
        Object.freeze(this);
    }
    /**
     * Static factory to create a validation error.
     */
    static validation(message, metadata) {
        return new ResultError("VALIDATION_ERROR", message, metadata);
    }
    /**
     * Static factory to create a not found error.
     */
    static notFound(message, metadata) {
        return new ResultError("NOT_FOUND", message, metadata);
    }
    /**
     * Static factory to create an unauthorized access error.
     */
    static unauthorized(message, metadata) {
        return new ResultError("UNAUTHORIZED", message, metadata);
    }
    /**
     * Static factory to create a conflict/business rule violation error.
     */
    static conflict(message, metadata) {
        return new ResultError("CONFLICT", message, metadata);
    }
    /**
     * Static factory to create an unexpected internal system error.
     */
    static unexpected(message, metadata) {
        return new ResultError("INTERNAL_ERROR", message, metadata);
    }
}
