import { InfrastructureProfile } from "./InfrastructureProfile.js";

/**
 * InfrastructureConfiguration containing concrete resource parameters.
 */
export class InfrastructureConfiguration {
  constructor(
    public readonly profile: InfrastructureProfile,
    public readonly postgresUrl: string,
    public readonly maxPoolSize: number,
    public readonly redisUrl: string,
    public readonly messageBrokerUrl: string
  ) {
    Object.freeze(this);
  }
}
