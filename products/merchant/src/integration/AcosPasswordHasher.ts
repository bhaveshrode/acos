import bcrypt from "bcryptjs";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
import { IPasswordHasher } from "acos-backend/foundation/contracts/security/IPasswordHasher.js";

/**
 * Adapter implementing the IPasswordHasher domain contract using the secure bcrypt hashing.
 */
export class AcosPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  public async hash(password: string): Promise<Result<string>> {
    try {
      const hashed = await bcrypt.hash(password, this.saltRounds);
      return Result.ok(hashed);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }

  public async compare(password: string, hash: string): Promise<Result<boolean>> {
    try {
      const matches = await bcrypt.compare(password, hash);
      return Result.ok(matches);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message));
    }
  }
}
