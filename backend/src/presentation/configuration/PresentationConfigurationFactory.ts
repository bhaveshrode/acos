import { ConfigurationBuilder } from "./ConfigurationBuilder.js";
import { ConfigurationResolver } from "./ConfigurationResolver.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";

/**
 * PresentationConfigurationFactory constructing builders, resolvers, and validators.
 */
export class PresentationConfigurationFactory {
  public static createBuilder(): ConfigurationBuilder {
    return new ConfigurationBuilder();
  }

  public static createResolver(): ConfigurationResolver {
    return new ConfigurationResolver();
  }

  public static createValidator(): ConfigurationValidator {
    return new ConfigurationValidator();
  }
}
