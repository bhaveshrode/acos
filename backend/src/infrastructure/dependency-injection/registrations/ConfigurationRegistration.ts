import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { ConfigurationCache } from "../../configuration/cache/ConfigurationCache.js";

/**
 * Service registration helper binding active Configuration snapshots.
 */
export class ConfigurationRegistration {
  public static register(container: ServiceContainer): void {
    container.register(
      "ConfigurationSnapshot",
      () => ConfigurationCache.get(),
      Lifetime.SINGLETON
    );
  }
}
