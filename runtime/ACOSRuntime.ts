import { RuntimeFactory } from "./factories/RuntimeFactory.js";
import { RuntimeConfiguration } from "./configuration/RuntimeConfiguration.js";
import { SubsystemLifecycle } from "./lifecycle/SubsystemLifecycle.js";
import { HealthReport } from "./health/HealthReport.js";

/**
 * ACOSRuntime central facade orchestrator for ACOS.
 */
export class ACOSRuntime {
  private configSnap?: RuntimeConfiguration;
  private bootOrder: string[] = [];

  constructor(public readonly factory: RuntimeFactory = new RuntimeFactory()) {}

  public async initialize(env: string, overrides: Partial<RuntimeConfiguration> = {}): Promise<void> {
    this.factory.telemetry.startTrace("ACOS_INITIALIZE");

    // 1. Resolve and validate configurations
    this.configSnap = this.factory.config.resolve(env, overrides);

    // 2. Initialize bootstrap service
    await this.factory.initializer.initialize(env);

    // 3. Validate subsystem graph
    const validation = this.factory.validator.validate();
    if (!validation.isValid) {
      throw new Error(`Composition validation failed: ${validation.errors.join(", ")}`);
    }

    this.factory.telemetry.endTrace("ACOS_INITIALIZE");
  }

  public async start(): Promise<boolean> {
    if (!this.configSnap) {
      throw new Error("Cannot start ACOSRuntime: call initialize() first");
    }

    this.factory.telemetry.startTrace("ACOS_STARTUP");

    // Boot all registered subsystems sequentially based on topological sort
    this.bootOrder = await this.factory.bootstrapper.boot((sub) => {
      this.factory.telemetry.startTrace(sub);
      this.factory.telemetry.endTrace(sub); // Track latency
    });

    this.factory.telemetry.endTrace("ACOS_STARTUP");
    return true;
  }

  public getStatus(subsystemName: string): SubsystemLifecycle {
    return this.factory.lifecycle.getState(subsystemName);
  }

  public async getHealth(): Promise<HealthReport> {
    return await this.factory.health.evaluate();
  }

  public getSubsystem(name: string): any {
    return this.factory.resolver.resolveFactory(name);
  }

  public async shutdown(): Promise<boolean> {
    this.factory.telemetry.startTrace("ACOS_SHUTDOWN");

    // Drain and shut down all subsystems in reverse order
    await this.factory.shutdownService.shutdown(this.bootOrder, (sub) => {
      this.factory.lifecycle.setState(sub, SubsystemLifecycle.STOPPED);
    });

    this.factory.telemetry.endTrace("ACOS_SHUTDOWN");
    return true;
  }

  public getConfig(): RuntimeConfiguration | undefined {
    return this.configSnap;
  }

  public dispose(): void {
    this.factory.composition.registry.clear();
    this.factory.composition.events.clear();
    this.factory.composition.subscriptions.clear();
    this.factory.composition.capabilities.clear();
    this.factory.composition.telemetry.clear();
    this.factory.composition.metrics.clear();
  }
}
