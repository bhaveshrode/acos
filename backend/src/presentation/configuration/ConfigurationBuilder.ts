import { PresentationConfiguration } from "./PresentationConfiguration.js";
import { CompositeConfigurationLoader } from "./CompositeConfigurationLoader.js";
import { ConfigurationResolver } from "./ConfigurationResolver.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";
import { ConfigurationCache } from "./ConfigurationCache.js";
import { ConfigurationRegistry } from "./ConfigurationRegistry.js";

/**
 * ConfigurationBuilder assembling presentation config payloads.
 */
export class ConfigurationBuilder {
  public build(): PresentationConfiguration {
    const providers = ConfigurationRegistry.getProviders();
    const loader = new CompositeConfigurationLoader(providers);
    const rawData = loader.load();

    const resolver = new ConfigurationResolver();
    const resolved = resolver.resolve(rawData);

    const validator = new ConfigurationValidator();
    validator.validate(resolved);

    ConfigurationCache.set(resolved);
    return resolved;
  }
}
