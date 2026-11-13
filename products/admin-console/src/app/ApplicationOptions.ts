/**
 * ApplicationOptions defining frontend config endpoints, environment, and debug toggles.
 */
export interface ApplicationOptions {
  apiBaseUrl: string;
  wsUrl: string;
  environment: string;
  enableLogging: boolean;
}
