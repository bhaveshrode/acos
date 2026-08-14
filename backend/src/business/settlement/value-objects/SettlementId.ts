import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Settlement identifier.
 */
export class SettlementId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new SettlementId.
   */
  public static override generate(): SettlementId {
    return new SettlementId();
  }

  /**
   * Creates a SettlementId from a string UUID representation.
   */
  public static override from(value: string): SettlementId {
    return new SettlementId(value);
  }
}
