import { RuntimeComposition } from "./RuntimeComposition.js";
/**
 * RuntimeFactory acting as the centralized composition gateway.
 */
export class RuntimeFactory {
    composition;
    constructor(composition = new RuntimeComposition()) {
        this.composition = composition;
        Object.freeze(this);
    }
    get registry() { return this.composition.registry; }
    get resolver() { return this.composition.resolver; }
    get graph() { return this.composition.graph; }
    get validator() { return this.composition.validator; }
    get lifecycle() { return this.composition.lifecycleManager; }
    get initializer() { return this.composition.initializer; }
    get shutdownService() { return this.composition.shutdownService; }
    get bootstrapper() { return this.composition.bootstrapper; }
    get config() { return this.composition.configResolver; }
    get coordinator() { return this.composition.lifecycleCoordinator; }
    get readiness() { return this.composition.readiness; }
    get drain() { return this.composition.drainManager; }
    get health() { return this.composition.health; }
    get events() { return this.composition.events; }
    get subscriptions() { return this.composition.subscriptions; }
    get recovery() { return this.composition.eventRecovery; }
    get capabilities() { return this.composition.capabilities; }
    get security() { return this.composition.security; }
    get telemetry() { return this.composition.telemetry; }
    get metrics() { return this.composition.metrics; }
    get diagnostics() { return this.composition.diagnostics; }
    get certifier() { return this.composition.certifier; }
}
