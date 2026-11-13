/**
 * GuardResult representing routing guard execution checks outcomes.
 */
export class GuardResult {
  private constructor(
    public readonly allowed: boolean,
    public readonly redirectUrl?: string,
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }

  public static allow(): GuardResult {
    return new GuardResult(true);
  }

  public static deny(reason?: string): GuardResult {
    return new GuardResult(false, undefined, reason);
  }

  public static redirect(url: string, reason?: string): GuardResult {
    return new GuardResult(false, url, reason);
  }
}
