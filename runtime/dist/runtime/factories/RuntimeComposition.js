import { SubsystemRegistry } from "../composition/SubsystemRegistry.js";
import { SubsystemResolver } from "../composition/SubsystemResolver.js";
import { DependencyGraph } from "../composition/DependencyGraph.js";
import { CompositionValidator } from "../composition/CompositionValidator.js";
import { RuntimeLifecycleManager } from "../bootstrap/RuntimeLifecycleManager.js";
import { RuntimeInitializer } from "../bootstrap/RuntimeInitializer.js";
import { RuntimeShutdown } from "../bootstrap/RuntimeShutdown.js";
import { RuntimeBootstrapper } from "../bootstrap/RuntimeBootstrapper.js";
import { ConfigurationResolver } from "../configuration/ConfigurationResolver.js";
import { LifecycleCoordinator } from "../lifecycle/LifecycleCoordinator.js";
import { RuntimeCertifier } from "../bootstrap/RuntimeCertifier.js";
import { ReadinessManager } from "../lifecycle/ReadinessManager.js";
import { DrainManager } from "../lifecycle/DrainManager.js";
import { HealthManager } from "../health/HealthManager.js";
import { RuntimeEventBus } from "../events/RuntimeEventBus.js";
import { EventSubscriptionManager } from "../events/EventSubscriptionManager.js";
import { EventRecoveryManager } from "../events/EventRecoveryManager.js";
import { CapabilityRegistry } from "../security/CapabilityRegistry.js";
import { RuntimeSecurityManager } from "../security/RuntimeSecurityManager.js";
import { RuntimeTelemetry } from "../observability/RuntimeTelemetry.js";
import { RuntimeMetrics } from "../observability/RuntimeMetrics.js";
import { RuntimeDiagnosticReporter } from "../observability/RuntimeDiagnosticReporter.js";
/**
 * RuntimeComposition coordinates system dependencies and utilities.
 */
export class RuntimeComposition {
    registry = new SubsystemRegistry();
    resolver = new SubsystemResolver(this.registry);
    graph = new DependencyGraph(this.registry);
    validator = new CompositionValidator(this.registry);
    lifecycleManager = new RuntimeLifecycleManager();
    initializer = new RuntimeInitializer();
    shutdownService = new RuntimeShutdown();
    bootstrapper = new RuntimeBootstrapper(this.graph, this.lifecycleManager);
    configResolver = new ConfigurationResolver();
    lifecycleCoordinator = new LifecycleCoordinator(this.lifecycleManager);
    readiness = new ReadinessManager(this.lifecycleManager);
    drainManager = new DrainManager(this.lifecycleManager);
    health = new HealthManager();
    events = new RuntimeEventBus();
    subscriptions = new EventSubscriptionManager(this.events);
    eventRecovery = new EventRecoveryManager(this.events);
    capabilities = new CapabilityRegistry();
    security = new RuntimeSecurityManager(this.capabilities);
    telemetry = new RuntimeTelemetry();
    metrics = new RuntimeMetrics();
    diagnostics = new RuntimeDiagnosticReporter(this.telemetry, this.metrics);
    certifier = new RuntimeCertifier();
    constructor() {
        Object.freeze(this);
    }
}
