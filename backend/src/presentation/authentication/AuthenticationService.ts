import { TokenValidator } from "./TokenValidator.js";
import { ClaimsMapper } from "./ClaimsMapper.js";
import { AuthenticationContext } from "./AuthenticationContext.js";

/**
 * AuthenticationService coordinating validation tasks and claims parsing outputs.
 */
export class AuthenticationService {
  constructor(
    private readonly validator: TokenValidator,
    private readonly mapper: ClaimsMapper
  ) {}

  /**
   * Cryptographically authenticates a token string.
   */
  public authenticate(token: string): AuthenticationContext {
    try {
      const claims = this.validator.validate(token);
      return this.mapper.map(claims, token);
    } catch (err: any) {
      return new AuthenticationContext({ isAuthenticated: false });
    }
  }
}
