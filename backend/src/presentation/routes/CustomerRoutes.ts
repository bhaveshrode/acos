import { CustomerController } from "../controllers/CustomerController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * CustomerRoutes mapping HTTP methods to CustomerController actions.
 */
export class CustomerRoutes {
  constructor(private readonly controller: CustomerController) {}

  /**
   * Compiles the customer endpoint route group.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/customers")
      .addRoute("POST", "", (req: any) => this.controller.createCustomer(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getCustomerById(req.params.id))
      .addRoute("PUT", "/:id", (req: any) => this.controller.updateCustomer(req.params.id, req.body))
      .addRoute("DELETE", "/:id", (req: any) => this.controller.deleteCustomer(req.params.id))
      .build();
  }
}
