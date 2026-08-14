import { SettlementController } from "../controllers/SettlementController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * SettlementRoutes mapping transaction settlements.
 */
export class SettlementRoutes {
  constructor(private readonly controller: SettlementController) {}

  /**
   * Compiles the settlement routes group.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/settlements")
      .addRoute("POST", "", (req: any) => this.controller.initiateSettlement(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getSettlementById(req.params.id))
      .addRoute("POST", "/:id/complete", (req: any) => this.controller.completeSettlement(req.params.id))
      .build();
  }
}
