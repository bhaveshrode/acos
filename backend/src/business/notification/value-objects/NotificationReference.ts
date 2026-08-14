import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface NotificationReferenceProps {
  value: string;
}

/**
 * Value Object representing a validated notification business reference code (e.g. NTF-2027-000001).
 */
export class NotificationReference extends ValueObject<NotificationReferenceProps> {
  private constructor(props: NotificationReferenceProps) {
    super(props);
  }

  /**
   * Creates a NotificationReference.
   */
  public static create(value: string): Result<NotificationReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Notification reference cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("NTF-")) {
      return Result.fail(
        ResultError.validation(`Invalid notification reference: '${value}'. Must start with 'NTF-'.`)
      );
    }
    return Result.ok(new NotificationReference({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
