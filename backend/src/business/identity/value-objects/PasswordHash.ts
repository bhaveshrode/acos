import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { IPasswordHasher } from "../../../foundation/contracts/security/IPasswordHasher.js";

export interface PasswordHashProps {
  value: string;
}

/**
 * Value Object holding a cryptographically hashed user password.
 * Restricts plaintext exposure and integrates comparison contracts.
 */
export class PasswordHash extends ValueObject<PasswordHashProps> {
  private constructor(props: PasswordHashProps) {
    super(props);
  }

  /**
   * Creates a PasswordHash Value Object from an existing hash string.
   * @param value The pre-hashed string.
   */
  public static create(value: string): Result<PasswordHash> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Password hash cannot be empty."));
    }
    return Result.ok(new PasswordHash({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }

  /**
   * Comapres a plaintext password with this password hash using the provided hasher.
   * @param plaintext The unhashed password candidate.
   * @param hasher The IPasswordHasher implementation.
   */
  public async compare(plaintext: string, hasher: IPasswordHasher): Promise<boolean> {
    const res = await hasher.compare(plaintext, this.value);
    return res.isSuccess && res.value === true;
  }
}
