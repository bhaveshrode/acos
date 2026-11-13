import { Result } from "../../../foundation/result/Result.js";
import { User } from "../aggregates/User.js";

/**
 * Activates a pending user by consuming the emailed verification token.
 */
export function verifyUserEmail(user: User, tokenValue: string): Result<void> {
  return user.verifyEmail(tokenValue);
}
