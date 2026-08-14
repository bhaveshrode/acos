import { describe, it, expect } from "vitest";
import { OperationsFactory } from "../factories/OperationsFactory.js";
import { DeploymentState } from "../deployment/DeploymentState.js";
import { ContainerState } from "../containers/ContainerState.js";
import { MonitorState } from "../monitoring/MonitorState.js";
import { SecretProvider } from "../secrets/SecretProvider.js";
import { JobState } from "../scheduler/JobState.js";
import { BackupType } from "../backups/BackupType.js";
import { ScaleDirection } from "../scaling/ScaleDirection.js";
import { GatewayState } from "../gateway/GatewayState.js";
import { MetricType } from "../metrics/MetricType.js";

describe("Operations & Platform Layer Integration Master Suite with Refinements (Task 81.7)", () => {
  const factory = new OperationsFactory();

  it("should coordinate deployment plans, executor, and pipeline validation execution state loops", async () => {
    const context = factory.deployment.createContext("production", "v1.0.0");
    expect(context.env).toBe("production");
    expect(context.version).toBe("v1.0.0");

    const plan = factory.deployment.createPlan("production", ["build", "test", "deploy"]);
    const executor = factory.deployment.createExecutor();
    const pipeline = factory.deployment.createPipeline(executor);
    expect(pipeline.state).toBe(DeploymentState.Pending);

    const success = await pipeline.execute(plan);
    expect(success).toBe(true);
    expect(pipeline.state).toBe(DeploymentState.Success);

    const emptyPlan = factory.deployment.createPlan("production", []);
    const failSuccess = await pipeline.execute(emptyPlan);
    expect(failSuccess).toBe(false);
    expect(pipeline.state).toBe(DeploymentState.Failed);
  });

  it("should build, registry package, and catalog container images and instances", () => {
    const builder = factory.containers.createBuilder();
    const descriptor = builder.build("web-srv", "nginx", "alpine");
    expect(descriptor.id).toBe("web-srv");
    expect(descriptor.image.name).toBe("nginx");
    expect(descriptor.image.tag).toBe("alpine");
    expect(descriptor.instance?.instanceId).toBe("web-srv-inst");
    expect(descriptor.instance?.state).toBe(ContainerState.Stopped);

    const registry = factory.containers.createRegistry();
    registry.register(descriptor);
    expect(registry.get("web-srv")).toBe(descriptor);

    registry.freeze();
    expect(() => registry.register(descriptor)).toThrow("ContainerRegistry is frozen");
  });

  it("should monitor cpu, memory, disk, process resources implementing IMonitor interface", () => {
    const cpu = factory.monitoring.createCpuMonitor();
    const mem = factory.monitoring.createMemoryMonitor();
    const disk = factory.monitoring.createDiskMonitor();
    const proc = factory.monitoring.createProcessMonitor();

    const registry = factory.monitoring.createRegistry();
    registry.register("cpu", cpu);
    registry.register("memory", mem);

    expect(registry.get("cpu").getMetricName()).toBe("cpu_load");
    expect(registry.get("cpu").getUsage()).toBe(15);
    expect(registry.get("memory").getUsage()).toBe(45);
    expect(disk.getUsage()).toBe(60);
    expect(proc.getUsage()).toBe(120);
  });

  it("should aggregate logs and distributed tracing spans across collector hosts", async () => {
    const logger = factory.logging.createAggregator();
    const entry = factory.logging.createEntry("info", "Hello from ACOS operations");
    logger.log(entry);

    expect(logger.getLogs()).toHaveLength(1);
    expect(logger.getLogs()[0].message).toBe("Hello from ACOS operations");

    const exporter = factory.logging.createLokiExporter();
    const success = await exporter.export(logger.getLogs());
    expect(success).toBe(true);

    const tracer = factory.tracing.createCollector();
    const span = factory.tracing.createContext("t-123", "s-456", "p-789");
    tracer.recordSpan(span);

    expect(tracer.getSpan("s-456")).toBe(span);
    expect(tracer.getSpans()).toHaveLength(1);

    const traceExporter = factory.tracing.createExporter();
    const traceSuccess = await traceExporter.export(tracer.getSpans());
    expect(traceSuccess).toBe(true);
  });

  it("should collect metrics values and resolve secrets keys from Vault providers implementing ISecretProvider", async () => {
    const collector = factory.metrics.createCollector();
    const metricVal = factory.metrics.createValue("http_requests_total", MetricType.Counter, 50, { path: "/dashboard" });
    collector.record(metricVal);

    expect(collector.get("http_requests_total")).toBe(metricVal);
    expect(collector.getAll()).toHaveLength(1);

    const vaultProvider = factory.secrets.createVaultProvider();
    const secrets = factory.secrets.createManager(vaultProvider);
    const secretKey = factory.secrets.createKey("db_password", "super-secret");
    await secrets.storeSecret(secretKey);

    const retrieved = await secrets.getSecret("db_password");
    expect(retrieved).toBe(secretKey);
  });

  it("should schedule cron tasks and format backup files using planners and executors", async () => {
    const scheduler = factory.scheduler.createScheduler();
    let triggered = false;
    const cronJob = factory.scheduler.createCronJob("backup-job", "0 0 * * *", () => {
      triggered = true;
    });

    scheduler.schedule(cronJob);
    expect(scheduler.getJob("backup-job")).toBe(cronJob);

    const planner = factory.backups.createPlanner();
    const executor = factory.backups.createBackupExecutor();
    const restoreExecutor = factory.backups.createRestoreExecutor();

    const plan = planner.createPlan(BackupType.Database);
    expect(plan).toBe("plan-database");

    const dbBackupFile = await executor.runBackup(BackupType.Database, plan);
    expect(dbBackupFile).toContain("backup-database-plan-database-");
    expect(dbBackupFile).toContain(".tar.gz");

    const restoreSuccess = await restoreExecutor.runRestore(dbBackupFile);
    expect(restoreSuccess).toBe(true);
  });

  it("should evaluate loads scaling decisions and balance gateway proxy routes targets", () => {
    const scaler = factory.scaling.createAutoscaler();
    const pool = factory.scaling.createWorkerPool();

    expect(scaler.evaluate(85)).toBe(ScaleDirection.Up);
    expect(scaler.evaluate(15)).toBe(ScaleDirection.Down);
    expect(scaler.evaluate(50)).toBeUndefined();

    pool.resize(5);
    expect(pool.getWorkerCount()).toBe(5);

    const proxy = factory.gateway.createReverseProxy();
    const limiter = factory.gateway.createRateLimiter();
    const balancer = factory.gateway.createLoadBalancer();

    expect(proxy.route("/api/invoices")).toBe("http://backend-api");
    expect(proxy.route("/index.html")).toBe("http://frontend-static");

    expect(limiter.isAllowed("127.0.0.1", 2)).toBe(true);
    expect(limiter.isAllowed("127.0.0.1", 2)).toBe(true);
    expect(limiter.isAllowed("127.0.0.1", 2)).toBe(false); // blocked third request

    const targets = ["srv-1", "srv-2"];
    expect(balancer.selectTarget(targets)).toBe("srv-1");
    expect(balancer.selectTarget(targets)).toBe("srv-2");
    expect(balancer.selectTarget(targets)).toBe("srv-1");
  });

  it("should capture telemetry coordinator snapshots and execute profiler memory diagnostics", async () => {
    const logger = factory.logging.createAggregator();
    const metrics = factory.metrics.createCollector();
    const tracer = factory.tracing.createCollector();

    logger.log(factory.logging.createEntry("warn", "High memory detected"));
    metrics.record(factory.metrics.createValue("cpu_load", MetricType.Gauge, 92));
    tracer.recordSpan(factory.tracing.createContext("t-1", "s-1"));

    const coordinator = factory.observability.createCoordinator(logger, metrics, tracer);
    const snapshot = coordinator.captureSnapshot();

    expect(snapshot.logs).toHaveLength(1);
    expect(snapshot.metrics).toHaveLength(1);
    expect(snapshot.traces).toHaveLength(1);

    const profiler = factory.diagnostics.createProfiler();
    const leakReport = profiler.analyzeMemory(2 * 1024 * 1024 * 1024); // 2GB
    expect(leakReport.issueDetected).toBe(true);
    expect(leakReport.details[0]).toContain("High memory utilization");

    const normalReport = profiler.analyzeMemory(512 * 1024 * 1024); // 512MB
    expect(normalReport.issueDetected).toBe(false);

    const manager = factory.maintenance.createManager();
    const task = factory.maintenance.createCleanupTask("clear-logs");
    manager.addTask(task);

    const taskResults = await manager.runAll();
    expect(taskResults).toEqual([true]);
  });
});
