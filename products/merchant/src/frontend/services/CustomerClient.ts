import { BaseClient } from "./BaseClient.js";

export class CustomerClient extends BaseClient {
  public async createCustomer(payload: any): Promise<any> {
    this.ctx.logger.info("Frontend: Registering a new customer...", { name: payload?.name });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("POST", "/business/customers", payload, headers);

    if (response.status !== 201) {
      this.ctx.logger.warn("Frontend: Customer registration failed", response.body);
      throw new Error(response.body.message || response.body.error || "Customer Registration Failed");
    }

    this.ctx.logger.info("Frontend: Customer registered successfully.");
    return response.body;
  }

  public async listCustomers(): Promise<any[]> {
    this.ctx.logger.info("Frontend: Listing business customers...");
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", "/business/customers", {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to list customers", response.body);
      throw new Error(response.body.message || response.body.error || "List Customers Failed");
    }

    return response.body;
  }

  public async getCustomer(id: string): Promise<any> {
    this.ctx.logger.info("Frontend: Fetching customer details...", { id });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", `/business/customers/${id}`, {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to retrieve customer", { id, error: response.body });
      throw new Error(response.body.message || response.body.error || "Get Customer Failed");
    }

    return response.body;
  }
}
