import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
/**
 * Value Object representing notification channel preferences.
 */
export class CommunicationPreferences extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a CommunicationPreferences.
     */
    static create(email = true, sms = false, portal = false) {
        return Result.ok(new CommunicationPreferences({ email, sms, portal }));
    }
    get email() { return this.props.email; }
    get sms() { return this.props.sms; }
    get portal() { return this.props.portal; }
}
