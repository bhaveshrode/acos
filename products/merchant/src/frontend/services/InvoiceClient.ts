import { BaseClient } from "./BaseClient.js";

export class InvoiceClient extends BaseClient {
  public async createInvoice(payload: any): Promise<any> {
    this.ctx.logger.info("Frontend: Requesting invoice creation...", { invoiceNumber: payload?.invoiceNumber });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("POST", "/business/invoices", payload, headers);

    if (response.status !== 201) {
      this.ctx.logger.warn("Frontend: Invoice registration failed", response.body);
      throw new Error(response.body.message || response.body.error || "Invoice Registration Failed");
    }

    this.ctx.logger.info("Frontend: Invoice created successfully.");
    return response.body;
  }

  public async listInvoices(): Promise<any[]> {
    this.ctx.logger.info("Frontend: Listing business invoices...");
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", "/business/invoices", {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to list invoices", response.body);
      throw new Error(response.body.message || response.body.error || "List Invoices Failed");
    }

    return response.body;
  }

  public async getInvoice(id: string): Promise<any> {
    this.ctx.logger.info("Frontend: Fetching invoice details...", { id });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", `/business/invoices/${id}`, {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to retrieve invoice", { id, error: response.body });
      throw new Error(response.body.message || response.body.error || "Get Invoice Failed");
    }

    return response.body;
  }

  public async issueInvoice(id: string): Promise<any> {
    this.ctx.logger.info("Frontend: Issuing invoice...", { id });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("POST", `/business/invoices/${id}/issue`, {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Issue invoice failed", { id, error: response.body });
      throw new Error(response.body.message || response.body.error || "Issue Invoice Failed");
    }

    this.ctx.logger.info("Frontend: Invoice issued successfully.");
    return response.body;
  }

  public async sendInvoice(id: string): Promise<any> {
    this.ctx.logger.info("Frontend: Sending invoice...", { id });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("POST", `/business/invoices/${id}/send`, {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Send invoice failed", { id, error: response.body });
      throw new Error(response.body.message || response.body.error || "Send Invoice Failed");
    }

    this.ctx.logger.info("Frontend: Invoice sent successfully.");
    return response.body;
  }
}
