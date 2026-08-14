import crypto from "crypto";
/**
 * PasswordHasher generating and verifying passwords using PBKDF2.
 */
export class PasswordHasher {
    /**
     * Generates a salt and hashes the input.
     */
    hash(password) {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
        return `${salt}:${hash}`;
    }
    /**
     * Asserts matches against stored credentials.
     */
    verify(password, storedHash) {
        const parts = storedHash.split(":");
        if (parts.length !== 2)
            return false;
        const [salt, hash] = parts;
        const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
        return hash === computedHash;
    }
}
