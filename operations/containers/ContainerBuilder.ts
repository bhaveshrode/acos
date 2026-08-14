import { ContainerDescriptor } from "./ContainerDescriptor.js";
import { ContainerImage } from "./ContainerImage.js";
import { ContainerInstance } from "./ContainerInstance.js";
import { ContainerState } from "./ContainerState.js";

/**
 * ContainerBuilder building images and instance descriptors.
 */
export class ContainerBuilder {
  public build(id: string, imageName: string, tag?: string): ContainerDescriptor {
    const image = new ContainerImage(imageName, tag);
    const instance = new ContainerInstance(`${id}-inst`, ContainerState.Stopped);
    return new ContainerDescriptor(id, image, instance);
  }
}
