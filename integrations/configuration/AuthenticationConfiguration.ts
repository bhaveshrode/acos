/**
 * AuthenticationConfiguration containing auth types and secrets.
 */
export class AuthenticationConfiguration {
  constructor(
    public readonly authType: "OAuth" | "ApiKey" | "Basic",
    public readonly credentials: Record<string, string> = {}
  ) {
    Object.freeze(this.credentials);
    Object.freeze(this);
  }
}
