import { IConfigurationProvider } from "../../../foundation/contracts/system/IConfigurationProvider.js";
import { EnvironmentConfigurationProvider } from "../providers/EnvironmentConfigurationProvider.js";
import { JsonConfigurationProvider } from "../providers/JsonConfigurationProvider.js";
import { CompositeConfigurationProvider } from "../providers/CompositeConfigurationProvider.js";

/**
 * Factory class generating configuration providers.
 */
export class ConfigurationProviderFactory {
  /**
   * Instantiates an EnvironmentConfigurationProvider.
   */
  public static createEnvironmentProvider(): IConfigurationProvider {
    return new EnvironmentConfigurationProvider();
  }

  /**
   * Instantiates a JsonConfigurationProvider.
   */
  public static createJsonProvider(values: Record<string, string>): IConfigurationProvider {
    return new JsonConfigurationProvider(values);
  }

  /**
   * Instantiates a CompositeConfigurationProvider.
   */
  public static createCompositeProvider(providers: IConfigurationProvider[]): IConfigurationProvider {
    return new CompositeConfigurationProvider(providers);
  }
}
