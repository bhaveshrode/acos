import { ValueObject } from "../core/ValueObject.js";

interface ValidationFailureProps {
  property: string;
  message: string;
}

/**
 * Value Object representing a single validation rule violation.
 */
export class ValidationFailure extends ValueObject<ValidationFailureProps> {
  /**
   * Creates a ValidationFailure.
   * @param property The name of the property that failed validation.
   * @param message A description of the validation failure.
   */
  constructor(property: string, message: string) {
    if (!property || property.trim() === "") {
      throw new Error("ValidationFailure property cannot be null or empty.");
    }
    if (!message || message.trim() === "") {
      throw new Error("ValidationFailure message cannot be null or empty.");
    }
    super({
      property: property.trim(),
      message: message.trim()
    });
  }

  /**
   * Gets the name of the property that failed validation.
   */
  public get property(): string {
    return this.props.property;
  }

  /**
   * Gets the failure explanation message.
   */
  public get message(): string {
    return this.props.message;
  }
}
