import { WorkflowController } from "../controllers/WorkflowController.js";
import { RouteGroup } from "./RouteGroup.js";
import { RouteBuilder } from "./RouteBuilder.js";

/**
 * WorkflowRoutes mapping process runs and state tasks.
 */
export class WorkflowRoutes {
  constructor(private readonly controller: WorkflowController) {}

  /**
   * Compiles the workflow routes group.
   */
  public getGroup(): RouteGroup {
    return new RouteBuilder()
      .withPrefix("/workflows")
      .addRoute("POST", "", (req: any) => this.controller.initiateWorkflow(req.body))
      .addRoute("GET", "/:id", (req: any) => this.controller.getWorkflowById(req.params.id))
      .build();
  }
}
