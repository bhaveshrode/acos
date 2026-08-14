import { DeploymentPlan } from "./DeploymentPlan.js";

/**
 * DeploymentExecutor executing deployment steps.
 */
export class DeploymentExecutor {
  public async run(plan: DeploymentPlan): Promise<boolean> {
    return plan.steps.length > 0;
  }
}
