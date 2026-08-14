/**
 * IExternalIdentityProvider interface declaring OAuth validation hooks.
 */
export interface IExternalIdentityProvider {
  validateToken(token: string): Promise<boolean>;
  getUserDetails(token: string): Promise<Record<string, any>>;
}
