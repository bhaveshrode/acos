/**
 * DeploymentPlan outlining targeted deployment steps.
 */
export class DeploymentPlan {
  constructor(
    public readonly targetEnv: string,
    public readonly steps: string[] = []
  ) {
    Object.freeze(this.steps);
    Object.freeze(this);
  }
}
