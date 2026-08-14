import { Result } from "../../result/Result.js";

/**
 * Interface representing cryptographic hashing and verification of password credentials (e.g. bcrypt, argon2).
 */
export interface IPasswordHasher {
  /**
   * Hashes a raw password string.
   */
  hash(password: string): Promise<Result<string>>;

  /**
   * Compares a raw password against an existing hash value.
   * Returns a successful Result containing true if they match, false otherwise.
   */
  compare(password: string, hash: string): Promise<Result<boolean>>;
}
