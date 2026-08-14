import { Logger, LogWriter } from "../../../../backend/src/foundation/logging/Logger.js";
import { MerchantBackend } from "../backend/MerchantBackend.js";
import { IClientContext } from "./services/BaseClient.js";
import { AuthClient } from "./services/AuthClient.js";
import { CustomerClient } from "./services/CustomerClient.js";
import { InvoiceClient } from "./services/InvoiceClient.js";
import { PaymentClient } from "./services/PaymentClient.js";
import { SystemClient } from "./services/SystemClient.js";

export class MerchantFrontend {
  private readonly logger: Logger;
  private sessionToken: string | null = null;

  // Domain service client instances
  private readonly authClient: AuthClient;
  private readonly customerClient: CustomerClient;
  private readonly invoiceClient: InvoiceClient;
  private readonly paymentClient: PaymentClient;
  private readonly systemClient: SystemClient;

  constructor(
    private readonly backend: MerchantBackend,
    logWriter: LogWriter
  ) {
    this.logger = new Logger("MerchantFrontend", logWriter);

    // Build the decoupled context wrapper
    const ctx: IClientContext = {
      getHeaders: () => this.getHeaders(),
      getSessionToken: () => this.getSessionToken(),
      setSessionToken: (token) => {
        this.sessionToken = token;
      },
      backend: this.backend,
      logger: this.logger
    };

    this.authClient = new AuthClient(ctx);
    this.customerClient = new CustomerClient(ctx);
    this.invoiceClient = new InvoiceClient(ctx);
    this.paymentClient = new PaymentClient(ctx);
    this.systemClient = new SystemClient(ctx);
  }

  /**
   * Retrieves the current simulated client session token.
   */
  public getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Clears the current client session token manually.
   */
  public clearSessionToken(): void {
    this.sessionToken = null;
  }

  /**
   * Helper to build request headers including Bearer token if authenticated.
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.sessionToken) {
      headers["Authorization"] = `Bearer ${this.sessionToken}`;
    }
    return headers;
  }

  // Auth operations
  public signUp(email: string, passwordPlaintext: string, name: string): Promise<any> {
    return this.authClient.signUp(email, passwordPlaintext, name);
  }

  public login(email: string, passwordPlaintext: string): Promise<any> {
    return this.authClient.login(email, passwordPlaintext);
  }

  public logout(): Promise<void> {
    return this.authClient.logout();
  }

  public queryMe(): Promise<any> {
    return this.authClient.queryMe();
  }

  // Business context onboarding operations
  public onboardBusiness(
    name: string,
    slug: string,
    currency: string = "USD",
    businessType: string = "Retail",
    country: string = "USA",
    contactInfo: string = ""
  ): Promise<any> {
    return this.systemClient.onboardBusiness(name, slug, currency, businessType, country, contactInfo);
  }

  public queryBusiness(): Promise<any> {
    return this.systemClient.queryBusiness();
  }

  public queryDashboard(): Promise<any> {
    return this.systemClient.queryDashboard();
  }

  // Customer operations
  public createCustomer(payload: any): Promise<any> {
    return this.customerClient.createCustomer(payload);
  }

  public listCustomers(): Promise<any[]> {
    return this.customerClient.listCustomers();
  }

  public getCustomer(id: string): Promise<any> {
    return this.customerClient.getCustomer(id);
  }

  // Invoice operations
  public createInvoice(payload: any): Promise<any> {
    return this.invoiceClient.createInvoice(payload);
  }

  public listInvoices(): Promise<any[]> {
    return this.invoiceClient.listInvoices();
  }

  public getInvoice(id: string): Promise<any> {
    return this.invoiceClient.getInvoice(id);
  }

  public issueInvoice(id: string): Promise<any> {
    return this.invoiceClient.issueInvoice(id);
  }

  public sendInvoice(id: string): Promise<any> {
    return this.invoiceClient.sendInvoice(id);
  }

  // Payment operations
  public collectPayment(invoiceId: string, amount?: number): Promise<any> {
    return this.paymentClient.collectPayment(invoiceId, amount);
  }

  public simulateWebhook(
    gatewayReference: string,
    success: boolean,
    errorCode?: string,
    errorMessage?: string
  ): Promise<any> {
    return this.paymentClient.simulateWebhook(gatewayReference, success, errorCode, errorMessage);
  }

  public getPayment(id: string): Promise<any> {
    return this.paymentClient.getPayment(id);
  }

  public listPayments(): Promise<any[]> {
    return this.paymentClient.listPayments();
  }

  // Health and connection check utility methods
  public queryHealth(): Promise<any> {
    return this.systemClient.queryHealth();
  }

  public queryAcosConnectivityStatus(): Promise<any> {
    return this.systemClient.queryAcosConnectivityStatus();
  }

  public triggerSimulatedError(): Promise<void> {
    return this.systemClient.triggerSimulatedError();
  }

  public triggerUnknownRoute(): Promise<any> {
    return this.systemClient.triggerUnknownRoute();
  }
}
