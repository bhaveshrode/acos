import { JwtTokenProvider } from "./JwtTokenProvider.js";

/**
 * TokenValidator executing claims validation on incoming bearer headers.
 */
export class TokenValidator {
  constructor(private readonly jwtProvider: JwtTokenProvider) {}

  public validate(token: string): any {
    return this.jwtProvider.verifyToken(token);
  }
}
