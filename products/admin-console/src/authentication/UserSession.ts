/**
 * UserSession representing authenticated credentials, claims, and token metadata.
 */
export class UserSession {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly token: string,
    public readonly claims: Readonly<Record<string, any>> = {},
    public readonly expirationTime: number = 0,
    public readonly refreshToken?: string
  ) {
    Object.freeze(this.claims);
    Object.freeze(this);
  }

  public isExpired(currentTimeMs: number = Date.now()): boolean {
    return this.expirationTime > 0 && currentTimeMs >= this.expirationTime;
  }
}
