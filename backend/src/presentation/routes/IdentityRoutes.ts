import { IdentityController } from "../controllers/IdentityController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * IdentityRoutes mapping authentication routes.
 */
export class IdentityRoutes {
  constructor(private readonly controller: IdentityController) {}

  /**
   * Compiles the identity user routes.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/users")
      .addRoute("POST", "/register", (req: any) => this.controller.register(req.body))
      .addRoute("POST", "/login", (req: any) => this.controller.login(req.body))
      .addRoute("POST", "/logout", (req: any) => this.controller.logout(req.body))
      .build();
  }
}
