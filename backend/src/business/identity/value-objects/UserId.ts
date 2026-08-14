import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique User identifier.
 */
export class UserId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new UserId.
   */
  public static override generate(): UserId {
    return new UserId();
  }

  /**
   * Creates a UserId from an existing UUID string.
   */
  public static override from(value: string): UserId {
    return new UserId(value);
  }
}
