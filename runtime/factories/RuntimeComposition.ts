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
  public readonly registry = new SubsystemRegistry();
  public readonly resolver = new SubsystemResolver(this.registry);
  public readonly graph = new DependencyGraph(this.registry);
  public readonly validator = new CompositionValidator(this.registry);

  public readonly lifecycleManager = new RuntimeLifecycleManager();
  public readonly initializer = new RuntimeInitializer();
  public readonly shutdownService = new RuntimeShutdown();
  public readonly bootstrapper = new RuntimeBootstrapper(this.graph, this.lifecycleManager);

  public readonly configResolver = new ConfigurationResolver();
  public readonly lifecycleCoordinator = new LifecycleCoordinator(this.lifecycleManager);
  public readonly readiness = new ReadinessManager(this.lifecycleManager);
  public readonly drainManager = new DrainManager(this.lifecycleManager);

  public readonly health = new HealthManager();
  public readonly events = new RuntimeEventBus();
  public readonly subscriptions = new EventSubscriptionManager(this.events);
  public readonly eventRecovery = new EventRecoveryManager(this.events);

  public readonly capabilities = new CapabilityRegistry();
  public readonly security = new RuntimeSecurityManager(this.capabilities);

  public readonly telemetry = new RuntimeTelemetry();
  public readonly metrics = new RuntimeMetrics();
  public readonly diagnostics = new RuntimeDiagnosticReporter(this.telemetry, this.metrics);
  public readonly certifier = new RuntimeCertifier();

  constructor() {
    Object.freeze(this);
  }
}
