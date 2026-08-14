/**
 * ClaimsPrincipal holding claims records and verifying claim presence.
 */
export class ClaimsPrincipal {
  constructor(
    public readonly userId: string,
    public readonly claims: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.claims);
    Object.freeze(this);
  }

  public hasClaim(type: string, value?: any): boolean {
    if (!(type in this.claims)) return false;
    if (value === undefined) return true;
    return this.claims[type] === value;
  }

  public getClaim(type: string): any {
    return this.claims[type];
  }
}
