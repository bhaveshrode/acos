import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing an immutable physical postal address.
 */
export class Address extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an Address.
     */
    static create(line1, city, state, country, postalCode, line2) {
        if (!line1 || line1.trim() === "") {
            return Result.fail(ResultError.validation("Address line1 cannot be empty."));
        }
        if (!city || city.trim() === "") {
            return Result.fail(ResultError.validation("Address city cannot be empty."));
        }
        if (!state || state.trim() === "") {
            return Result.fail(ResultError.validation("Address state cannot be empty."));
        }
        if (!country || country.trim() === "") {
            return Result.fail(ResultError.validation("Address country cannot be empty."));
        }
        if (!postalCode || postalCode.trim() === "") {
            return Result.fail(ResultError.validation("Address postalCode cannot be empty."));
        }
        return Result.ok(new Address({
            line1: line1.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            postalCode: postalCode.trim(),
            line2: line2 ? line2.trim() : undefined
        }));
    }
    get line1() { return this.props.line1; }
    get line2() { return this.props.line2; }
    get city() { return this.props.city; }
    get state() { return this.props.state; }
    get country() { return this.props.country; }
    get postalCode() { return this.props.postalCode; }
}
