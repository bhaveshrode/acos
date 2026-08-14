import { AuthenticationResult } from "./AuthenticationResult.js";

/**
 * IAuthenticationProvider contract interface representing authentication execution methods.
 */
export interface IAuthenticationProvider {
  authenticate(credentials: any): Promise<AuthenticationResult>;
}
