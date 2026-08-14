import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Email } from "../value-objects/Email.js";
import { PasswordResetToken } from "../value-objects/PasswordResetToken.js";

/**
 * Domain event emitted when a User recovery request is initiated, containing the reset token.
 */
export class PasswordResetRequested extends BaseDomainEvent {
  public readonly email: Email;
  public readonly resetToken: PasswordResetToken;

  constructor(userId: string, email: Email, resetToken: PasswordResetToken) {
    super(userId, "User");
    this.email = email;
    this.resetToken = resetToken;
  }
}
