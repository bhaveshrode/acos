/**
 * ContainerDeployment wrapping container configurations.
 */
export class ContainerDeployment {
  constructor(
    public readonly serviceName: string,
    public readonly cpuLimit: string,
    public readonly memoryLimit: string,
    public readonly envVars: Record<string, string>,
    public readonly livenessPath: string = "/health/liveness",
    public readonly readinessPath: string = "/health/readiness"
  ) {
    Object.freeze(this.envVars);
    Object.freeze(this);
  }
}
