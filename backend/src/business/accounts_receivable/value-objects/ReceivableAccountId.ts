import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Receivable account identifier.
 */
export class ReceivableAccountId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new ReceivableAccountId.
   */
  public static override generate(): ReceivableAccountId {
    return new ReceivableAccountId();
  }

  /**
   * Creates a ReceivableAccountId from a string UUID representation.
   */
  public static override from(value: string): ReceivableAccountId {
    return new ReceivableAccountId(value);
  }
}
