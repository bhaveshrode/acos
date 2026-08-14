import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a long-lived OAuth/session renewal refresh token.
 */
export class RefreshToken extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a RefreshToken Value Object.
     */
    static create(token, expiresAt) {
        if (!token || token.trim() === "") {
            return Result.fail(ResultError.validation("Refresh token value cannot be empty."));
        }
        if (!expiresAt) {
            return Result.fail(ResultError.validation("Refresh token expiration date is required."));
        }
        return Result.ok(new RefreshToken({ token: token.trim(), expiresAt }));
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
