import { PaymentController } from "../controllers/PaymentController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * PaymentRoutes mapping payment processing endpoints.
 */
export class PaymentRoutes {
  constructor(private readonly controller: PaymentController) {}

  /**
   * Compiles the payment routes group.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/payments")
      .addRoute("POST", "", (req: any) => this.controller.initiatePayment(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getPaymentById(req.params.id))
      .addRoute("POST", "/:id/confirm", (req: any) => this.controller.confirmPayment(req.params.id))
      .build();
  }
}
