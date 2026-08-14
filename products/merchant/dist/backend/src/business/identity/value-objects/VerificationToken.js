import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a single-use token for email identity verification.
 */
export class VerificationToken extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a VerificationToken Value Object.
     */
    static create(token, expiresAt) {
        if (!token || token.trim() === "") {
            return Result.fail(ResultError.validation("Verification token value cannot be empty."));
        }
        if (!expiresAt) {
            return Result.fail(ResultError.validation("Verification token expiration date is required."));
        }
        return Result.ok(new VerificationToken({ token: token.trim(), expiresAt }));
    }
    get token() {
        return this.props.token;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get isExpired() {
        return Date.now() >= this.expiresAt.getTime();
    }
}
