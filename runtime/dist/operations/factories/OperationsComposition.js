"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsComposition = void 0;
const DeploymentFactory_js_1 = require("../deployment/DeploymentFactory.js");
const ContainerFactory_js_1 = require("../containers/ContainerFactory.js");
const MonitoringFactory_js_1 = require("../monitoring/MonitoringFactory.js");
const LoggingFactory_js_1 = require("../logging/LoggingFactory.js");
const TracingFactory_js_1 = require("../tracing/TracingFactory.js");
const MetricsFactory_js_1 = require("../metrics/MetricsFactory.js");
const SecretsFactory_js_1 = require("../secrets/SecretsFactory.js");
const SchedulerFactory_js_1 = require("../scheduler/SchedulerFactory.js");
const BackupsFactory_js_1 = require("../backups/BackupsFactory.js");
const ScalingFactory_js_1 = require("../scaling/ScalingFactory.js");
const GatewayFactory_js_1 = require("../gateway/GatewayFactory.js");
const ObservabilityFactory_js_1 = require("../observability/ObservabilityFactory.js");
const DiagnosticsFactory_js_1 = require("../diagnostics/DiagnosticsFactory.js");
const MaintenanceFactory_js_1 = require("../maintenance/MaintenanceFactory.js");
/**
 * OperationsComposition bundling sub-factory allocations to simplify constructor parameters count.
 */
class OperationsComposition {
    deployment;
    containers;
    monitoring;
    logging;
    tracing;
    metrics;
    secrets;
    scheduler;
    backups;
    scaling;
    gateway;
    observability;
    diagnostics;
    maintenance;
    constructor(deployment = new DeploymentFactory_js_1.DeploymentFactory(), containers = new ContainerFactory_js_1.ContainerFactory(), monitoring = new MonitoringFactory_js_1.MonitoringFactory(), logging = new LoggingFactory_js_1.LoggingFactory(), tracing = new TracingFactory_js_1.TracingFactory(), metrics = new MetricsFactory_js_1.MetricsFactory(), secrets = new SecretsFactory_js_1.SecretsFactory(), scheduler = new SchedulerFactory_js_1.SchedulerFactory(), backups = new BackupsFactory_js_1.BackupsFactory(), scaling = new ScalingFactory_js_1.ScalingFactory(), gateway = new GatewayFactory_js_1.GatewayFactory(), observability = new ObservabilityFactory_js_1.ObservabilityFactory(), diagnostics = new DiagnosticsFactory_js_1.DiagnosticsFactory(), maintenance = new MaintenanceFactory_js_1.MaintenanceFactory()) {
        this.deployment = deployment;
        this.containers = containers;
        this.monitoring = monitoring;
        this.logging = logging;
        this.tracing = tracing;
        this.metrics = metrics;
        this.secrets = secrets;
        this.scheduler = scheduler;
        this.backups = backups;
        this.scaling = scaling;
        this.gateway = gateway;
        this.observability = observability;
        this.diagnostics = diagnostics;
        this.maintenance = maintenance;
        Object.freeze(this);
    }
}
exports.OperationsComposition = OperationsComposition;
