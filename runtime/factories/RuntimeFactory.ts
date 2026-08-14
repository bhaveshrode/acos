import { RuntimeComposition } from "./RuntimeComposition.js";

/**
 * RuntimeFactory acting as the centralized composition gateway.
 */
export class RuntimeFactory {
  constructor(
    public readonly composition = new RuntimeComposition()
  ) {
    Object.freeze(this);
  }

  public get registry() { return this.composition.registry; }
  public get resolver() { return this.composition.resolver; }
  public get graph() { return this.composition.graph; }
  public get validator() { return this.composition.validator; }

  public get lifecycle() { return this.composition.lifecycleManager; }
  public get initializer() { return this.composition.initializer; }
  public get shutdownService() { return this.composition.shutdownService; }
  public get bootstrapper() { return this.composition.bootstrapper; }

  public get config() { return this.composition.configResolver; }
  public get coordinator() { return this.composition.lifecycleCoordinator; }
  public get readiness() { return this.composition.readiness; }
  public get drain() { return this.composition.drainManager; }

  public get health() { return this.composition.health; }
  public get events() { return this.composition.events; }
  public get subscriptions() { return this.composition.subscriptions; }
  public get recovery() { return this.composition.eventRecovery; }

  public get capabilities() { return this.composition.capabilities; }
  public get security() { return this.composition.security; }

  public get telemetry() { return this.composition.telemetry; }
  public get metrics() { return this.composition.metrics; }
  public get diagnostics() { return this.composition.diagnostics; }
  public get certifier() { return this.composition.certifier; }
}
