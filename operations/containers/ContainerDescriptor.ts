import { ContainerImage } from "./ContainerImage.js";
import { ContainerInstance } from "./ContainerInstance.js";

/**
 * ContainerDescriptor grouping image definitions and running instances metadata.
 */
export class ContainerDescriptor {
  constructor(
    public readonly id: string,
    public readonly image: ContainerImage,
    public readonly instance?: ContainerInstance,
    public readonly envVars: Record<string, string> = {}
  ) {
    Object.freeze(this.envVars);
    Object.freeze(this);
  }
}
