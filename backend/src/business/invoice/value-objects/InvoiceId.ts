import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Invoice identifier.
 */
export class InvoiceId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new InvoiceId.
   */
  public static override generate(): InvoiceId {
    return new InvoiceId();
  }

  /**
   * Creates an InvoiceId from a string UUID representation.
   */
  public static override from(value: string): InvoiceId {
    return new InvoiceId(value);
  }
}
