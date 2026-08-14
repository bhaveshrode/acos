import { DeploymentContext } from "./DeploymentContext.js";
import { DeploymentPlan } from "./DeploymentPlan.js";
import { DeploymentExecutor } from "./DeploymentExecutor.js";
import { DeploymentPipeline } from "./DeploymentPipeline.js";

/**
 * DeploymentFactory constructing executors and pipelines.
 */
export class DeploymentFactory {
  public static createContext(env: string, version: string): DeploymentContext {
    return new DeploymentContext(env, version);
  }

  public static createPlan(targetEnv: string, steps: string[]): DeploymentPlan {
    return new DeploymentPlan(targetEnv, steps);
  }

  public static createExecutor(): DeploymentExecutor {
    return new DeploymentExecutor();
  }

  public static createPipeline(executor?: DeploymentExecutor): DeploymentPipeline {
    return new DeploymentPipeline(executor);
  }

  public createContext(env: string, version: string): DeploymentContext {
    return DeploymentFactory.createContext(env, version);
  }

  public createPlan(targetEnv: string, steps: string[]): DeploymentPlan {
    return DeploymentFactory.createPlan(targetEnv, steps);
  }

  public createExecutor(): DeploymentExecutor {
    return DeploymentFactory.createExecutor();
  }

  public createPipeline(executor?: DeploymentExecutor): DeploymentPipeline {
    return DeploymentFactory.createPipeline(executor);
  }
}
