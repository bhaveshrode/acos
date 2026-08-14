import bcrypt from "bcryptjs";
import { Result } from "acos-backend/foundation/result/Result.js";
import { ResultError } from "acos-backend/foundation/result/ResultError.js";
/**
 * Adapter implementing the IPasswordHasher domain contract using the secure bcrypt hashing.
 */
export class AcosPasswordHasher {
    saltRounds = 10;
    async hash(password) {
        try {
            const hashed = await bcrypt.hash(password, this.saltRounds);
            return Result.ok(hashed);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
    async compare(password, hash) {
        try {
            const matches = await bcrypt.compare(password, hash);
            return Result.ok(matches);
        }
        catch (err) {
            return Result.fail(ResultError.unexpected(err.message));
        }
    }
}
