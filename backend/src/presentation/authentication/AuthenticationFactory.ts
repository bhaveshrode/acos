import { JwtTokenProvider } from "./JwtTokenProvider.js";
import { TokenValidator } from "./TokenValidator.js";
import { ClaimsMapper } from "./ClaimsMapper.js";
import { AuthenticationService } from "./AuthenticationService.js";
import { SessionManager } from "./SessionManager.js";
import { PasswordHasher } from "./PasswordHasher.js";
import { ApiKeyAuthenticator } from "./ApiKeyAuthenticator.js";

/**
 * AuthenticationFactory class organizing token signers, hashers, and validators.
 */
export class AuthenticationFactory {
  public static createJwtTokenProvider(secret: string): JwtTokenProvider {
    return new JwtTokenProvider(secret);
  }

  public static createTokenValidator(jwtProvider: JwtTokenProvider): TokenValidator {
    return new TokenValidator(jwtProvider);
  }

  public static createClaimsMapper(): ClaimsMapper {
    return new ClaimsMapper();
  }

  public static createService(validator: TokenValidator, mapper: ClaimsMapper): AuthenticationService {
    return new AuthenticationService(validator, mapper);
  }

  public static createSessionManager(): SessionManager {
    return new SessionManager();
  }

  public static createPasswordHasher(): PasswordHasher {
    return new PasswordHasher();
  }

  public static createApiKeyAuthenticator(): ApiKeyAuthenticator {
    return new ApiKeyAuthenticator();
  }
}
