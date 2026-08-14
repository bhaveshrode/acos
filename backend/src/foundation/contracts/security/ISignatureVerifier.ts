import { Result } from "../../result/Result.js";

/**
 * Interface representing cryptographic signature verification (e.g. Ed25519, Secp256k1 for blockchain transactions).
 */
export interface ISignatureVerifier {
  /**
   * Verifies that a signature is valid for a given message and public key.
   */
  verify(message: string, signature: string, publicKey: string): Promise<Result<boolean>>;
}
