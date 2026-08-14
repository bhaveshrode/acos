import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Payment identifier.
 */
export class PaymentId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new PaymentId.
   */
  public static override generate(): PaymentId {
    return new PaymentId();
  }

  /**
   * Creates a PaymentId from a string UUID representation.
   */
  public static override from(value: string): PaymentId {
    return new PaymentId(value);
  }
}
