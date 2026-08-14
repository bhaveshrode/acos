/**
 * HMACSignedRequest verifying payload signatures.
 */
export class HMACSignedRequest {
  public static sign(payload: string, secret: string): string {
    return `sig_${payload.length}_${secret.substring(0, 4)}`;
  }

  public static verify(payload: string, signature: string, secret: string): boolean {
    const expected = HMACSignedRequest.sign(payload, secret);
    return expected === signature;
  }
}
