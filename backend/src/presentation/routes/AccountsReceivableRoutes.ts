import { AccountsReceivableController } from "../controllers/AccountsReceivableController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * AccountsReceivableRoutes mapping receivable and balance writeoff endpoints.
 */
export class AccountsReceivableRoutes {
  constructor(private readonly controller: AccountsReceivableController) {}

  /**
   * Compiles the accounts receivable route definitions.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/receivables")
      .addRoute("POST", "", (req: any) => this.controller.createReceivable(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getReceivableById(req.params.id))
      .addRoute("POST", "/:id/writeoff", (req: any) => this.controller.writeoffReceivable(req.params.id))
      .build();
  }
}
