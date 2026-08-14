import { AuthenticationState } from "./AuthenticationState.js";
import { UserSession } from "./UserSession.js";
import { AuthenticationOptions } from "./AuthenticationOptions.js";

/**
 * AuthenticationContext holding active sessions and security state parameters.
 */
export class AuthenticationContext {
  constructor(
    public readonly state: AuthenticationState,
    public readonly options: AuthenticationOptions,
    public readonly session?: UserSession
  ) {
    Object.freeze(this);
  }
}
