/**
 * ContainerBuilder generating target Docker build settings.
 */
export class ContainerBuilder {
  public buildImage(serviceName: string, tag = "latest"): { imageName: string; command: string } {
    const imageName = `acos-${serviceName.toLowerCase()}:${tag}`;
    const command = `docker build -t ${imageName} -f ./infrastructure/containers/Dockerfile.${serviceName.toLowerCase()} .`;
    return { imageName, command };
  }
}
