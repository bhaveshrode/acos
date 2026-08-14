import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
/**
 * Value Object representing Organization-level preferences and defaults.
 */
export class OrganizationSettings extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an OrganizationSettings object.
     */
    static create(defaultCurrency, timeZone, invoiceNumberFormat = "INV-YYYYMMDD-XXXX") {
        return Result.ok(new OrganizationSettings({
            defaultCurrency,
            timeZone,
            invoiceNumberFormat
        }));
    }
    get defaultCurrency() { return this.props.defaultCurrency; }
    get timeZone() { return this.props.timeZone; }
    get invoiceNumberFormat() { return this.props.invoiceNumberFormat; }
}
