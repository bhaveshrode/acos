/**
 * IntegrationConfiguration containing provider mappings.
 */
export class IntegrationConfiguration {
  constructor(
    public readonly providerName: string,
    public readonly configData: Record<string, any> = {}
  ) {
    Object.freeze(this.configData);
    Object.freeze(this);
  }
}
