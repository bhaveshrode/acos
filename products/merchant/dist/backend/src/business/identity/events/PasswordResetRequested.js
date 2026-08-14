import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a User recovery request is initiated, containing the reset token.
 */
export class PasswordResetRequested extends BaseDomainEvent {
    email;
    resetToken;
    constructor(userId, email, resetToken) {
        super(userId, "User");
        this.email = email;
        this.resetToken = resetToken;
    }
}
