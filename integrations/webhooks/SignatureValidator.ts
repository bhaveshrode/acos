import { HMACSignedRequest } from "../security/HMACSignedRequest.js";

/**
 * SignatureValidator validating signatures against registered secrets.
 */
export class SignatureValidator {
  public validate(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    return HMACSignedRequest.verify(payload, signature, secret);
  }
}
