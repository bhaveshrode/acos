import { OrganizationController } from "../controllers/OrganizationController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * OrganizationRoutes mapping tenant operations.
 */
export class OrganizationRoutes {
  constructor(private readonly controller: OrganizationController) {}

  /**
   * Compiles the organization route configurations.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/organizations")
      .addRoute("POST", "", (req: any) => this.controller.createOrganization(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getOrganization(req.params.id))
      .build();
  }
}
