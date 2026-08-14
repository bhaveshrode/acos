import { DeploymentFactory } from "../deployment/DeploymentFactory.js";
import { ContainerFactory } from "../containers/ContainerFactory.js";
import { MonitoringFactory } from "../monitoring/MonitoringFactory.js";
import { LoggingFactory } from "../logging/LoggingFactory.js";
import { TracingFactory } from "../tracing/TracingFactory.js";
import { MetricsFactory } from "../metrics/MetricsFactory.js";
import { SecretsFactory } from "../secrets/SecretsFactory.js";
import { SchedulerFactory } from "../scheduler/SchedulerFactory.js";
import { BackupsFactory } from "../backups/BackupsFactory.js";
import { ScalingFactory } from "../scaling/ScalingFactory.js";
import { GatewayFactory } from "../gateway/GatewayFactory.js";
import { ObservabilityFactory } from "../observability/ObservabilityFactory.js";
import { DiagnosticsFactory } from "../diagnostics/DiagnosticsFactory.js";
import { MaintenanceFactory } from "../maintenance/MaintenanceFactory.js";

/**
 * OperationsComposition bundling sub-factory allocations to simplify constructor parameters count.
 */
export class OperationsComposition {
  constructor(
    public readonly deployment: DeploymentFactory = new DeploymentFactory(),
    public readonly containers: ContainerFactory = new ContainerFactory(),
    public readonly monitoring: MonitoringFactory = new MonitoringFactory(),
    public readonly logging: LoggingFactory = new LoggingFactory(),
    public readonly tracing: TracingFactory = new TracingFactory(),
    public readonly metrics: MetricsFactory = new MetricsFactory(),
    public readonly secrets: SecretsFactory = new SecretsFactory(),
    public readonly scheduler: SchedulerFactory = new SchedulerFactory(),
    public readonly backups: BackupsFactory = new BackupsFactory(),
    public readonly scaling: ScalingFactory = new ScalingFactory(),
    public readonly gateway: GatewayFactory = new GatewayFactory(),
    public readonly observability: ObservabilityFactory = new ObservabilityFactory(),
    public readonly diagnostics: DiagnosticsFactory = new DiagnosticsFactory(),
    public readonly maintenance: MaintenanceFactory = new MaintenanceFactory()
  ) {
    Object.freeze(this);
  }
}
