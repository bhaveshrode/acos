import crypto from "crypto";

/**
 * Wallet manager simulating address generation from public keys and signing payload hex values.
 */
export class WalletManager {
  /**
   * Generates a unique 40-character hexadecimal wallet address from a public key string.
   */
  public static generateAddressFromPublicKey(pubKey: string): string {
    const hash = crypto.createHash("sha256").update(pubKey).digest("hex");
    return "0x" + hash.substring(0, 40);
  }

  /**
   * Generates a transaction HMAC signature using private key credentials.
   */
  public static signTransaction(privateKey: string, txPayload: string): string {
    return crypto.createHmac("sha256", privateKey).update(txPayload).digest("hex");
  }
}
