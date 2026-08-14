import { InvoiceController } from "../controllers/InvoiceController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * InvoiceRoutes mapping billing endpoint queries/commands.
 */
export class InvoiceRoutes {
  constructor(private readonly controller: InvoiceController) {}

  /**
   * Compiles the invoice endpoint route configs.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/invoices")
      .addRoute("POST", "", (req: any) => this.controller.createInvoice(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getInvoiceById(req.params.id))
      .addRoute("POST", "/:id/issue", (req: any) => this.controller.issueInvoice(req.params.id))
      .addRoute("POST", "/:id/cancel", (req: any) => this.controller.cancelInvoice(req.params.id))
      .build();
  }
}
