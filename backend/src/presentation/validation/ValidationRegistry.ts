import { ValidationSchema } from "./ValidationSchema.js";

/**
 * ValidationRegistry catalog ledger mapping policy names to ValidationSchema maps.
 */
export class ValidationRegistry {
  private static schemas = new Map<string, ValidationSchema>();

  /**
   * Registers a validation schema.
   */
  public static registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
  }

  /**
   * Resolves a registered schema by name.
   */
  public static getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name);
  }

  /**
   * Clears registry records.
   */
  public static clear(): void {
    this.schemas.clear();
  }
}
