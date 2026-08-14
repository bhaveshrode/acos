import { ContainerImage } from "./ContainerImage.js";
import { ContainerInstance } from "./ContainerInstance.js";
import { ContainerDescriptor } from "./ContainerDescriptor.js";
import { ContainerRegistry } from "./ContainerRegistry.js";
import { ContainerBuilder } from "./ContainerBuilder.js";

/**
 * ContainerFactory creating images and instances.
 */
export class ContainerFactory {
  public static createImage(name: string, tag?: string): ContainerImage {
    return new ContainerImage(name, tag);
  }

  public static createInstance(instanceId: string, state?: any): ContainerInstance {
    return new ContainerInstance(instanceId, state);
  }

  public static createDescriptor(
    id: string,
    image: ContainerImage,
    instance?: ContainerInstance,
    envVars?: Record<string, string>
  ): ContainerDescriptor {
    return new ContainerDescriptor(id, image, instance, envVars);
  }

  public static createRegistry(): ContainerRegistry {
    return new ContainerRegistry();
  }

  public static createBuilder(): ContainerBuilder {
    return new ContainerBuilder();
  }

  public createImage(name: string, tag?: string): ContainerImage {
    return ContainerFactory.createImage(name, tag);
  }

  public createInstance(instanceId: string, state?: any): ContainerInstance {
    return ContainerFactory.createInstance(instanceId, state);
  }

  public createDescriptor(
    id: string,
    image: ContainerImage,
    instance?: ContainerInstance,
    envVars?: Record<string, string>
  ): ContainerDescriptor {
    return ContainerFactory.createDescriptor(id, image, instance, envVars);
  }

  public createRegistry(): ContainerRegistry {
    return ContainerFactory.createRegistry();
  }

  public createBuilder(): ContainerBuilder {
    return ContainerFactory.createBuilder();
  }
}
