import { AcosIntegrationBoundary } from "../integration/AcosIntegrationBoundary.js";
import { AuthController } from "./controllers/AuthController.js";
import { BusinessController } from "./controllers/BusinessController.js";
import { CustomerController } from "./controllers/CustomerController.js";
import { InvoiceController } from "./controllers/InvoiceController.js";
import { PaymentController } from "./controllers/PaymentController.js";
import { SystemController } from "./controllers/SystemController.js";

export class MerchantRouter {
  private readonly controllers: Array<{
    handle(
      method: string,
      path: string,
      payload?: any,
      headers?: Record<string, string>
    ): Promise<{ status: number; body: any } | null>;
  }>;

  private readonly authController: AuthController;

  constructor(
    private readonly acosBoundary: AcosIntegrationBoundary,
    private readonly config: any,
    private readonly logger: any,
    private readonly invoiceCache: Map<string, any>,
    private readonly dashboardCache: Map<string, any>
  ) {
    this.authController = new AuthController(acosBoundary, config, logger);

    this.controllers = [
      this.authController,
      new BusinessController(acosBoundary, config, logger, dashboardCache),
      new CustomerController(acosBoundary, config, logger),
      new InvoiceController(acosBoundary, config, logger, invoiceCache),
      new PaymentController(acosBoundary, config, logger),
      new SystemController(acosBoundary, config, logger)
    ];
  }

  /**
   * Helper to extract token from authorization header (Bearer) or session cookie.
   */
  public extractBearerToken(headers?: Record<string, string>): string | null {
    return this.authController.extractBearerToken(headers);
  }

  /**
   * Internal routing logic delegating to the specialized controllers.
   */
  public async handleRequestInternal(
    method: string,
    path: string,
    payload?: any,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: any }> {
    this.logger.info("Received request", { method, path });

    try {
      for (const controller of this.controllers) {
        const result = await controller.handle(method, path, payload, headers);
        if (result !== null) {
          return result;
        }
      }

      this.logger.warn("Route not found", { method, path });
      return {
        status: 404,
        body: { error: `Route '${method} ${path}' not found.` }
      };
    } catch (err: any) {
      this.logger.error("Error occurred while processing request", err, { path });
      return {
        status: 500,
        body: { error: "Internal Server Error", message: err.message }
      };
    }
  }
}
