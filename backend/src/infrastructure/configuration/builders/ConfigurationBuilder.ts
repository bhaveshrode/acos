import { IConfigurationProvider } from "../../../foundation/contracts/system/IConfigurationProvider.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";
import { ConfigurationFactory } from "../../../foundation/config/ConfigurationFactory.js";
import { CompositeConfigurationProvider } from "../providers/CompositeConfigurationProvider.js";
import { EnvironmentConfigurationProvider } from "../providers/EnvironmentConfigurationProvider.js";
import { JsonConfigurationProvider } from "../providers/JsonConfigurationProvider.js";
import { JsonLoader } from "../loaders/JsonLoader.js";

/**
 * Fluent builder class accumulating loaders and providers to construct a validated ConfigurationSnapshot.
 */
export class ConfigurationBuilder {
  private readonly providers: IConfigurationProvider[] = [];

  /**
   * Appends JSON file configurations to the builder stack.
   */
  public addJsonFile(filePath: string): this {
    const values = JsonLoader.load(filePath);
    this.providers.push(new JsonConfigurationProvider(values));
    return this;
  }

  /**
   * Appends environment variable overrides to the builder stack.
   */
  public addEnvironmentVariables(): this {
    this.providers.push(new EnvironmentConfigurationProvider());
    return this;
  }

  /**
   * Appends a custom configuration provider directly.
   */
  public addProvider(provider: IConfigurationProvider): this {
    this.providers.push(provider);
    return this;
  }

  /**
   * Builds, merges, and validates the configuration, returning the immutable ConfigurationSnapshot.
   */
  public build(): ConfigurationSnapshot {
    const composite = new CompositeConfigurationProvider(this.providers);
    return ConfigurationFactory.create(composite);
  }
}
