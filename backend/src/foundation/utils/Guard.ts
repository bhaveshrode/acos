/**
 * Utility containing defensive assertion guards to validate programming assumptions and preconditions.
 * Throws standard Error exceptions on failures.
 */
export class Guard {
  public static notNull(value: any, message: string = "Value cannot be null."): void {
    if (value === null) {
      throw new Error(message);
    }
  }

  public static notUndefined(value: any, message: string = "Value cannot be undefined."): void {
    if (value === undefined) {
      throw new Error(message);
    }
  }

  public static notNullOrUndefined(value: any, message: string = "Value cannot be null or undefined."): void {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
  }

  public static notEmpty(value: string, message: string = "String cannot be null or empty."): void {
    if (value === null || value === undefined || value.trim() === "") {
      throw new Error(message);
    }
  }

  public static isArray(value: any, message: string = "Value must be an array."): void {
    if (!Array.isArray(value)) {
      throw new Error(message);
    }
  }

  public static isObject(value: any, message: string = "Value must be an object."): void {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(message);
    }
  }
}
