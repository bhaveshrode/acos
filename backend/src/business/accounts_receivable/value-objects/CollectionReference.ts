import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CollectionReferenceProps {
  value: string;
}

/**
 * Value Object representing a collection activities business reference code (e.g. COL-2027-000012).
 */
export class CollectionReference extends ValueObject<CollectionReferenceProps> {
  private constructor(props: CollectionReferenceProps) {
    super(props);
  }

  /**
   * Creates a CollectionReference.
   */
  public static create(value: string): Result<CollectionReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Collection reference cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("COL-")) {
      return Result.fail(
        ResultError.validation(`Invalid collection reference: '${value}'. Must start with 'COL-'.`)
      );
    }
    return Result.ok(new CollectionReference({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
