import { IConfigurationLoader } from "./IConfigurationLoader.js";
import { CompositeConfigurationLoader } from "./CompositeConfigurationLoader.js";

/**
 * ConfigurationBuilder assembling application configuration loaders.
 */
export class ConfigurationBuilder {
  private readonly loaders: IConfigurationLoader[] = [];

  public addLoader(loader: IConfigurationLoader): this {
    this.loaders.push(loader);
    return this;
  }

  public build(): IConfigurationLoader {
    return new CompositeConfigurationLoader(this.loaders);
  }
}
