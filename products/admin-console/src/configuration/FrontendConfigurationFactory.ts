import { ConfigurationBuilder } from "./ConfigurationBuilder.js";
import { ConfigurationResolver } from "./ConfigurationResolver.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";
import { IConfigurationLoader } from "./IConfigurationLoader.js";
import { FrontendConfigurationProvider, IFrontendConfigurationProvider } from "./FrontendConfigurationProvider.js";

/**
 * FrontendConfigurationFactory constructing builders, resolvers, validators, and providers.
 */
export class FrontendConfigurationFactory {
  public static createBuilder(): ConfigurationBuilder {
    return new ConfigurationBuilder();
  }

  public static createResolver(
    loader: IConfigurationLoader,
    validator: ConfigurationValidator
  ): ConfigurationResolver {
    return new ConfigurationResolver(loader, validator);
  }

  public static createValidator(): ConfigurationValidator {
    return new ConfigurationValidator();
  }

  public static createProvider(): IFrontendConfigurationProvider {
    return new FrontendConfigurationProvider();
  }
}
