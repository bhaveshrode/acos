import { BaseClient } from "./BaseClient.js";

export class PaymentClient extends BaseClient {
  public async collectPayment(invoiceId: string, amount?: number): Promise<any> {
    this.ctx.logger.info("Frontend: Requesting payment collection...", { invoiceId, amount });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest(
      "POST",
      `/business/invoices/${invoiceId}/collect-payment`,
      { amount },
      headers
    );

    if (response.status !== 201) {
      this.ctx.logger.warn("Frontend: Collect payment failed", response.body);
      throw new Error(response.body.message || response.body.error || "Collect Payment Failed");
    }

    this.ctx.logger.info("Frontend: Payment collection request registered successfully.");
    return response.body;
  }

  public async simulateWebhook(
    gatewayReference: string,
    success: boolean,
    errorCode?: string,
    errorMessage?: string
  ): Promise<any> {
    this.ctx.logger.info("Frontend: Triggering simulated gateway webhook...", { gatewayReference, success });
    
    const response = await this.ctx.backend.handleRequest("POST", "/payments/webhook", {
      gatewayReference,
      success,
      errorCode,
      errorMessage
    });

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Webhook processing failed on backend", response.body);
      throw new Error(response.body.message || response.body.error || "Webhook Simulation Failed");
    }

    this.ctx.logger.info("Frontend: Webhook callback resolved successfully.");
    return response.body;
  }

  public async getPayment(id: string): Promise<any> {
    this.ctx.logger.info("Frontend: Fetching payment details...", { id });
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", `/business/payments/${id}`, {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to retrieve payment details", { id, error: response.body });
      throw new Error(response.body.message || response.body.error || "Get Payment Failed");
    }

    return response.body;
  }

  public async listPayments(): Promise<any[]> {
    this.ctx.logger.info("Frontend: Listing business payments...");
    const headers = this.ctx.getHeaders();
    const response = await this.ctx.backend.handleRequest("GET", "/business/payments", {}, headers);

    if (response.status !== 200) {
      this.ctx.logger.warn("Frontend: Failed to list payments", response.body);
      throw new Error(response.body.message || response.body.error || "List Payments Failed");
    }

    return response.body;
  }
}
