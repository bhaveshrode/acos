import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Email } from "../value-objects/Email.js";
import { VerificationToken } from "../value-objects/VerificationToken.js";

/**
 * Domain event emitted when a new User account is registered in ACOS.
 */
export class UserRegistered extends BaseDomainEvent {
  public readonly email: Email;
  public readonly verificationToken: VerificationToken;

  constructor(userId: string, email: Email, verificationToken: VerificationToken) {
    super(userId, "User");
    this.email = email;
    this.verificationToken = verificationToken;
  }
}
