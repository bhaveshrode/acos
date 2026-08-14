import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Organization identifier.
 */
export class OrganizationId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new OrganizationId.
   */
  public static override generate(): OrganizationId {
    return new OrganizationId();
  }

  /**
   * Creates an OrganizationId from an existing UUID string.
   */
  public static override from(value: string): OrganizationId {
    return new OrganizationId(value);
  }
}
