import { Result } from "../../result/Result.js";

export interface TokenPayload extends Record<string, any> {
  userId: string;
  roles: string[];
}

/**
 * Interface representing session and authorization token generation/verification (e.g. JWT).
 */
export interface ITokenProvider {
  /**
   * Generates a signed access token string.
   */
  generate(payload: TokenPayload, expiresInSeconds?: number): Promise<Result<string>>;

  /**
   * Verifies and decodes an access token string.
   * Returns a failed Result if token is malformed, expired, or signature is invalid.
   */
  verify(token: string): Promise<Result<TokenPayload>>;
}
