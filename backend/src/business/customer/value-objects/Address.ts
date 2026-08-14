import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface AddressProps {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/**
 * Value Object representing an immutable physical postal address.
 */
export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    super(props);
  }

  /**
   * Creates an Address.
   */
  public static create(
    line1: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    line2?: string
  ): Result<Address> {
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
    return Result.ok(
      new Address({
        line1: line1.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        line2: line2 ? line2.trim() : undefined
      })
    );
  }

  public get line1(): string { return this.props.line1; }
  public get line2(): string | undefined { return this.props.line2; }
  public get city(): string { return this.props.city; }
  public get state(): string { return this.props.state; }
  public get country(): string { return this.props.country; }
  public get postalCode(): string { return this.props.postalCode; }
}
