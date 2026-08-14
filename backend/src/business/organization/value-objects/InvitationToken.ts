import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface InvitationTokenProps {
  value: string;
}

/**
 * Value Object representing a single-use token sent to invitees.
 */
export class InvitationToken extends ValueObject<InvitationTokenProps> {
  private constructor(props: InvitationTokenProps) {
    super(props);
  }

  /**
   * Creates an InvitationToken.
   */
  public static create(value: string): Result<InvitationToken> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Invitation token cannot be empty."));
    }
    return Result.ok(new InvitationToken({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
