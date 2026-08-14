import { PresentationConfiguration } from "./PresentationConfiguration.js";

/**
 * ConfigurationContext tracking environment stage indicators and configuration snap values.
 */
export class ConfigurationContext {
  constructor(
    public readonly environment: string,
    public readonly values: PresentationConfiguration
  ) {}
}
