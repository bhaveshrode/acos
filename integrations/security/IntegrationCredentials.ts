/**
 * IntegrationCredentials wrapping external credentials secrets.
 */
export class IntegrationCredentials {
  constructor(
    public readonly clientId: string,
    public readonly clientSecret: string,
    public readonly tokenUrl?: string
  ) {
    Object.freeze(this);
  }
}
