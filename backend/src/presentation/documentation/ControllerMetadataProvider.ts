/**
 * ControllerMetadataProvider extracts controller details information.
 */
export class ControllerMetadataProvider {
  public getControllerInfo(controllerName: string): { summary: string } {
    return { summary: `Endpoints managed by ${controllerName}` };
  }
}
