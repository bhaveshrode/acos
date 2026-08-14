/**
 * DeploymentContext carrying target environment and version metadata snapshot.
 */
export class DeploymentContext {
  constructor(
    public readonly env: string,
    public readonly version: string,
    public readonly startTime: number = Date.now()
  ) {
    Object.freeze(this);
  }
}
