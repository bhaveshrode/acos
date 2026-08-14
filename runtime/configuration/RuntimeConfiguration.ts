import { EnvironmentProfile } from "./EnvironmentProfile.js";

/**
 * RuntimeConfiguration capturing environment details.
 */
export class RuntimeConfiguration {
  constructor(
    public readonly env: EnvironmentProfile,
    public readonly databaseUrl: string,
    public readonly apiUrl: string,
    public readonly websocketUrl: string,
    public readonly paymentProvider: string,
    public readonly blockchainProvider: string,
    public readonly isProduction: boolean = env === EnvironmentProfile.Production
  ) {
    Object.freeze(this);
  }
}
