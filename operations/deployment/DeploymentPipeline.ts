import { DeploymentPlan } from "./DeploymentPlan.js";
import { DeploymentState } from "./DeploymentState.js";
import { DeploymentExecutor } from "./DeploymentExecutor.js";

/**
 * DeploymentPipeline orchestrating plans execution delegating to executors.
 */
export class DeploymentPipeline {
  public state: DeploymentState = DeploymentState.Pending;

  constructor(private readonly executor: DeploymentExecutor = new DeploymentExecutor()) {}

  public async execute(plan: DeploymentPlan): Promise<boolean> {
    this.state = DeploymentState.Executing;
    const success = await this.executor.run(plan);
    this.state = success ? DeploymentState.Success : DeploymentState.Failed;
    return success;
  }
}
