import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a single-use token sent to invitees.
 */
export class InvitationToken extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an InvitationToken.
     */
    static create(value) {
        if (!value || value.trim() === "") {
            return Result.fail(ResultError.validation("Invitation token cannot be empty."));
        }
        return Result.ok(new InvitationToken({ value: value.trim() }));
    }
    get value() {
        return this.props.value;
    }
}
