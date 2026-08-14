import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Email } from "../value-objects/Email.js";

/**
 * Domain event emitted when a User's email verification is completed.
 */
export class EmailVerified extends BaseDomainEvent {
  public readonly email: Email;

  constructor(userId: string, email: Email) {
    super(userId, "User");
    this.email = email;
  }
}
