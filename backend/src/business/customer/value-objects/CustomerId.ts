import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Customer identifier.
 */
export class CustomerId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new CustomerId.
   */
  public static override generate(): CustomerId {
    return new CustomerId();
  }

  /**
   * Creates a CustomerId from a string UUID representation.
   */
  public static override from(value: string): CustomerId {
    return new CustomerId(value);
  }
}
