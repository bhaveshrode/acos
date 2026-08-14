import { InfrastructureComposition } from "./InfrastructureComposition.js";

/**
 * InfrastructureFactory acting as the composition Gateway root.
 */
export class InfrastructureFactory {
  constructor(
    public readonly composition = new InfrastructureComposition()
  ) {
    Object.freeze(this);
  }

  public get config() { return this.composition.config; }
  public get validator() { return this.composition.validator; }

  public get db() { return this.composition.dbConnection; }
  public get migrations() { return this.composition.migrationRunner; }
  public get backup() { return this.composition.dbBackup; }
  public get tx() { return this.composition.txVerifier; }

  public get cache() { return this.composition.cache; }
  public get locks() { return this.composition.locks; }

  public get broker() { return this.composition.broker; }

  public get containers() { return this.composition.containerBuilder; }
  public get gateway() { return this.composition.gateway; }

  public get cicd() { return this.composition.pipeline; }
  public get telemetry() { return this.composition.telemetry; }
}
