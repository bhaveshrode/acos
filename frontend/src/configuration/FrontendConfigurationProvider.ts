import { FrontendConfiguration } from "./FrontendConfiguration.js";
import { ConfigurationStore } from "./ConfigurationStore.js";

/**
 * IFrontendConfigurationProvider representing clean config retrieval interface contract.
 */
export interface IFrontendConfigurationProvider {
  getConfiguration(): FrontendConfiguration;
}

/**
 * FrontendConfigurationProvider wrapping access to immutable cached snapshots.
 */
export class FrontendConfigurationProvider implements IFrontendConfigurationProvider {
  public getConfiguration(): FrontendConfiguration {
    return ConfigurationStore.get();
  }
}
