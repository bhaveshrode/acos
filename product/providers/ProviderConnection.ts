/**
 * ProviderConnection documenting integration endpoints statuses.
 */
export class ProviderConnection {
  constructor(
    public readonly providerName: string,
    public readonly connected: boolean,
    public readonly webhookVerified: boolean,
    public readonly healthStatus: "ACTIVE" | "DEGRADED" | "INACTIVE"
  ) {
    Object.freeze(this);
  }
}
