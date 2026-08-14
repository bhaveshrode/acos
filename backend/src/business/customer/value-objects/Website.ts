import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WebsiteProps {
  value: string;
}

/**
 * Value Object representing a validated URL domain address.
 */
export class Website extends ValueObject<WebsiteProps> {
  private constructor(props: WebsiteProps) {
    super(props);
  }

  /**
   * Creates a Website.
   */
  public static create(value: string): Result<Website> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Website URL cannot be empty."));
    }
    const trimmed = value.trim();
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!pattern.test(trimmed)) {
      return Result.fail(ResultError.validation(`Invalid website URL format: '${value}'`));
    }
    return Result.ok(new Website({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
