import { BaseClient } from "./BaseClient.js";

export class SystemClient extends BaseClient {
  public async onboardBusiness(
    name: string,
    slug: string,
    currency: string = "USD",
    businessType: string = "Retail",
    country: string = "USA",
    contactInfo: string = ""
  ): Promise<any> {
    this.ctx.logger.info("Frontend: Submitting business onboarding...", { name, slug });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest(
      "POST",
      "/business/onboarding",
      { name, slug, currency, businessType, country, contactInfo },
      headers
    );

    if (response.status !== 201) {
      this.ctx.logger.warn("Frontend: Business Onboarding rejected", response.body);
      throw new Error(response.body.message || response.body.error || "Onboarding Failed");
    }

    this.ctx.logger.info("Frontend: Business Onboarding succeeded.", response.body);
    return response.body;
  }

  public async queryBusiness(): Promise<any> {
    this.ctx.logger.info("Frontend: Querying active business context (/business)...");
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", "/business", {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to fetch active business context", response.body);
      throw new Error(response.body.message || response.body.error || "Fetch Business Failed");
    }

    this.ctx.logger.info("Frontend: Active business context retrieved.", response.body);
    return response.body;
  }

  public async queryDashboard(): Promise<any> {
    this.ctx.logger.info("Frontend: Querying active business dashboard (/business/dashboard)...");
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", "/business/dashboard", {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to fetch dashboard stats", response.body);
      throw new Error(response.body.message || response.body.error || "Fetch Dashboard Failed");
    }

    this.ctx.logger.info("Frontend: Active business dashboard retrieved successfully.");
    return response.body;
  }

  public async queryHealth(): Promise<{ status: string; environment: string; port: number }> {
    this.ctx.logger.info("Frontend: Querying Backend health check status...");
    const response = await this.ctx.backend.handleRequest("GET", "/health");

    if (response.status !== 200) {
      this.ctx.logger.error("Frontend: Health check returned non-200 status", new Error(JSON.stringify(response.body)));
      throw new Error(`Backend Health Check Failed with status ${response.status}`);
    }

    this.ctx.logger.info("Frontend: Health check query succeeded.", response.body);
    return {
      status: response.body.status,
      environment: response.body.environment,
      port: response.body.port
    };
  }

  public async queryAcosConnectivityStatus(): Promise<{
    connected: boolean;
    acosSubsystems?: Record<string, string>;
    error?: string;
  }> {
    this.ctx.logger.info("Frontend: Querying Backend ACOS connectivity check status...");
    const response = await this.ctx.backend.handleRequest("GET", "/acos-status");

    if (response.status === 200) {
      this.ctx.logger.info("Frontend: ACOS is fully connected and healthy.");
      return {
        connected: true,
        acosSubsystems: response.body.acosSubsystems
      };
    }

    if (response.status === 502) {
      this.ctx.logger.warn("Frontend: Backend reports ACOS is disconnected.", response.body);
      return {
        connected: false,
        error: response.body.error
      };
    }

    this.ctx.logger.error("Frontend: ACOS status check query failed with unexpected error", new Error(JSON.stringify(response.body)));
    throw new Error(`ACOS Status Check Failed with status ${response.status}: ${response.body.error || "Unknown Error"}`);
  }

  public async triggerSimulatedError(): Promise<void> {
    this.ctx.logger.info("Frontend: Triggering simulated error route...");
    const response = await this.ctx.backend.handleRequest("POST", "/simulate-error");

    if (response.status === 500) {
      this.ctx.logger.info("Frontend: Expected 500 error captured successfully.", response.body);
      return;
    }

    throw new Error(`Frontend Error: Expected 500 status from simulated error route, but got ${response.status}`);
  }

  public async triggerUnknownRoute(): Promise<{ status: number; error: string }> {
    this.ctx.logger.info("Frontend: Triggering unknown route...");
    const response = await this.ctx.backend.handleRequest("GET", "/non-existent");
    return {
      status: response.status,
      error: response.body.error
    };
  }
}
