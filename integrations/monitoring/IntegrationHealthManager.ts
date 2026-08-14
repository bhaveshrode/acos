/**
 * IntegrationHealthManager tracking provider statuses and checking SaaS connectivity.
 */
export class IntegrationHealthManager {
  private readonly providerStatuses = new Map<string, "Healthy" | "Unhealthy" | "Degraded" | "Unknown">();

  public setStatus(
    provider: string,
    status: "Healthy" | "Unhealthy" | "Degraded" | "Unknown"
  ): void {
    this.providerStatuses.set(provider.toLowerCase(), status);
  }

  public getStatus(provider: string): "Healthy" | "Unhealthy" | "Degraded" | "Unknown" {
    return this.providerStatuses.get(provider.toLowerCase()) || "Unknown";
  }

  public async checkConnectivity(
    provider: string,
    pingFn: () => Promise<boolean>
  ): Promise<"Healthy" | "Unhealthy"> {
    try {
      const active = await pingFn();
      const status = active ? "Healthy" : "Unhealthy";
      this.setStatus(provider, status);
      return status;
    } catch {
      this.setStatus(provider, "Unhealthy");
      return "Unhealthy";
    }
  }
}
