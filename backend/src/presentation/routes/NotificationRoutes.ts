import { NotificationController } from "../controllers/NotificationController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * NotificationRoutes mapping notification alert triggers.
 */
export class NotificationRoutes {
  constructor(private readonly controller: NotificationController) {}

  /**
   * Compiles the notification routes group.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/notifications")
      .addRoute("POST", "", (req: any) => this.controller.sendNotification(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getNotificationById(req.params.id))
      .build();
  }
}
