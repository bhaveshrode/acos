import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Contact } from "../entities/Contact.js";

/**
 * Domain Service enforcing structure and constraints on customer contact representative listings.
 */
export class ContactPolicy {
  private readonly maxContacts: number;

  constructor(maxContacts: number = 10) {
    this.maxContacts = maxContacts;
  }

  /**
   * Asserts if a contact can be added based on roster size quotas.
   */
  public validateCanAddContact(existingContacts: Contact[]): Result<void> {
    if (existingContacts.length >= this.maxContacts) {
      return Result.fail(
        ResultError.conflict(
          `Customer profile has reached its maximum contact limit of ${this.maxContacts}.`
        )
      );
    }
    return Result.ok();
  }

  /**
   * Asserts that a contact listing maintains exactly one primary contact.
   */
  public validateHasPrimaryContact(contacts: Contact[]): Result<void> {
    const primaryCount = contacts.filter((c) => c.isPrimary).length;
    if (primaryCount !== 1) {
      return Result.fail(
        ResultError.validation(
          `Customer profile must have exactly one primary contact. Found ${primaryCount}.`
        )
      );
    }
    return Result.ok();
  }
}
