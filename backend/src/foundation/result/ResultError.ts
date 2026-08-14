import { ObjectUtils } from "../utils/ObjectUtils.js";

/**
 * Class representing a standardized Domain Error in ACOS.
 * Replaces raw string errors to support code categories, localization, and rich metadata.
 */
export class ResultError {
  public readonly code: string;
  public readonly message: string;
  public readonly metadata?: Record<string, any>;

  /**
   * Creates a new ResultError instance.
   * Enforces immutability by freezing the error instance and metadata.
   * @param code A unique uppercase category code (e.g. 'VALIDATION_ERROR').
   * @param message A human-readable error description.
   * @param metadata Optional additional key-value context.
   */
  constructor(code: string, message: string, metadata?: Record<string, any>) {
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
  public static validation(message: string, metadata?: Record<string, any>): ResultError {
    return new ResultError("VALIDATION_ERROR", message, metadata);
  }

  /**
   * Static factory to create a not found error.
   */
  public static notFound(message: string, metadata?: Record<string, any>): ResultError {
    return new ResultError("NOT_FOUND", message, metadata);
  }

  /**
   * Static factory to create an unauthorized access error.
   */
  public static unauthorized(message: string, metadata?: Record<string, any>): ResultError {
    return new ResultError("UNAUTHORIZED", message, metadata);
  }

  /**
   * Static factory to create a conflict/business rule violation error.
   */
  public static conflict(message: string, metadata?: Record<string, any>): ResultError {
    return new ResultError("CONFLICT", message, metadata);
  }

  /**
   * Static factory to create an unexpected internal system error.
   */
  public static unexpected(message: string, metadata?: Record<string, any>): ResultError {
    return new ResultError("INTERNAL_ERROR", message, metadata);
  }
}
