import { ServiceContainer } from "../container/ServiceContainer.js";
import { InfrastructureModule } from "../modules/InfrastructureModule.js";
import { DependencyGraphValidator } from "../validation/DependencyGraphValidator.js";

/**
 * Composition root bootstrapping the application container and assembly graphs.
 */
export class Bootstrapper {
  /**
   * Initializes the container, registers all dependencies, and performs startup validation.
   */
  public static bootstrap(): ServiceContainer {
    const container = new ServiceContainer();

    // 1. Register Infrastructure components
    InfrastructureModule.register(container);

    // 2. Perform graph dry-run checks
    DependencyGraphValidator.validate(container);

    return container;
  }
}
