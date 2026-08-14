import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object holding a cryptographically hashed user password.
 * Restricts plaintext exposure and integrates comparison contracts.
 */
export class PasswordHash extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PasswordHash Value Object from an existing hash string.
     * @param value The pre-hashed string.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Password hash cannot be empty."));
        }
        return Result.ok(new PasswordHash({ value: value.trim() }));
    }
    get value() {
        return this.props.value;
    }
    /**
     * Comapres a plaintext password with this password hash using the provided hasher.
     * @param plaintext The unhashed password candidate.
     * @param hasher The IPasswordHasher implementation.
     */
    async compare(plaintext, hasher) {
        const res = await hasher.compare(plaintext, this.value);
        return res.isSuccess && res.value === true;
    }
}
