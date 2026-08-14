/**
 * DeploymentPipeline executing CI/CD stages.
 */
export class DeploymentPipeline {
  private readonly history: string[] = [];

  public async runPipeline(stages: string[] = ["LINT", "TYPE_CHECK", "UNIT_TEST", "BUILD", "CONTAINER_BUILD", "DEPLOY"]): Promise<boolean> {
    for (const stage of stages) {
      // Simulate step latency
      await new Promise((resolve) => setTimeout(resolve, 5));
      this.history.push(stage);
    }
    return true;
  }

  public getHistory(): readonly string[] {
    return Object.freeze([...this.history]);
  }
}
