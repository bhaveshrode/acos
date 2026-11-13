import { FrontendConfiguration } from "./FrontendConfiguration.js";

/**
 * ConfigurationContext holding read-only configuration values for a specific environment.
 */
export class ConfigurationContext {
  public readonly environment: string;
  public readonly values: Readonly<FrontendConfiguration>;

  constructor(environment: string, values: FrontendConfiguration) {
    this.environment = environment;
    this.values = Object.freeze({ ...values });
    Object.freeze(this);
  }
}
