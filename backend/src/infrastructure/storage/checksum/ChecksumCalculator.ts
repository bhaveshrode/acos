import crypto from "crypto";

/**
 * Utility executing file payload integrity hashing using SHA-256.
 */
export class ChecksumCalculator {
  /**
   * Generates a SHA-256 hexadecimal hash string from the buffer.
   */
  public static calculateSha256(content: Buffer): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Verifies buffer payload hash against an expected hash string.
   */
  public static verifySha256(content: Buffer, expectedHash: string): boolean {
    const calculated = this.calculateSha256(content);
    return calculated.toLowerCase() === expectedHash.toLowerCase();
  }
}
