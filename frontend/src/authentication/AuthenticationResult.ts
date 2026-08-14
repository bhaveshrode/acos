import { UserSession } from "./UserSession.js";

/**
 * AuthenticationResult wrapping successes, failures, and challenge-required outcomes.
 */
export class AuthenticationResult {
  private constructor(
    public readonly success: boolean,
    public readonly session?: UserSession,
    public readonly error?: string,
    public readonly challengeRequired?: boolean
  ) {
    Object.freeze(this);
  }

  public static success(session: UserSession): AuthenticationResult {
    return new AuthenticationResult(true, session);
  }

  public static failed(error: string): AuthenticationResult {
    return new AuthenticationResult(false, undefined, error);
  }

  public static challenge(): AuthenticationResult {
    return new AuthenticationResult(false, undefined, undefined, true);
  }
}
