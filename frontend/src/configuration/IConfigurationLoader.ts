/**
 * IConfigurationLoader defining the load contract strategy.
 */
export interface IConfigurationLoader {
  load(): Record<string, any>;
}
