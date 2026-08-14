import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a single authentication login attempt record.
 * Used for security auditing and tracking lockouts.
 */
export class LoginAttempt extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a LoginAttempt record.
     */
    static create(timestamp, ipAddress, successful) {
        if (!timestamp) {
            return Result.fail(ResultError.validation("Login attempt timestamp is required."));
        }
        if (!ipAddress || ipAddress.trim() === "") {
            return Result.fail(ResultError.validation("Login attempt IP address cannot be empty."));
        }
        return Result.ok(new LoginAttempt({ timestamp, ipAddress: ipAddress.trim(), successful }));
    }
    get timestamp() {
        return this.props.timestamp;
    }
    get ipAddress() {
        return this.props.ipAddress;
    }
    get successful() {
        return this.props.successful;
    }
}
