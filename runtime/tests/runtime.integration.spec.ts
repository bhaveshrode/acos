import { describe, it, expect } from "vitest";
import { ACOSRuntime } from "../ACOSRuntime.js";
import { RuntimeFactory } from "../factories/RuntimeFactory.js";
import { SubsystemDescriptor } from "../composition/SubsystemDescriptor.js";
import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";
import { HealthCheck } from "../health/HealthCheck.js";

const compose = () => {
  const factory = new RuntimeFactory();
  const runtime = new ACOSRuntime(factory);
  const backend = { name: "backend" };
  const frontend = { name: "frontend" };

  factory.registry.register(new SubsystemDescriptor("backend", [], backend));
  factory.registry.register(new SubsystemDescriptor("frontend", ["backend"], frontend));

  return { factory, runtime, backend, frontend };
};

describe.sequential("ACOS Runtime — composition and lifecycle suite", () => {
  it("validates the composition graph and reports dependency cycles", () => {
    const { factory } = compose();

    expect(factory.validator.validate().isValid).toBe(true);

    factory.registry.register(new SubsystemDescriptor("backend", ["frontend"]));

    const invalid = factory.validator.validate();
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors[0]).toMatch(/Circular dependency/);
  });

  it("rejects descriptors that depend on unregistered subsystems", () => {
    const factory = new RuntimeFactory();
    factory.registry.register(new SubsystemDescriptor("frontend", ["backend"]));

    const validation = factory.validator.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("unregistered subsystem 'backend'");
  });

  it("boots subsystems in dependency order and reports readiness", async () => {
    const { factory, runtime, frontend } = compose();

    await runtime.initialize("production");
    expect(runtime.getConfig()?.isProduction).toBe(true);
    expect(factory.graph.getBootOrder()).toEqual(["backend", "frontend"]);

    await runtime.start();

    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.READY);
    expect(runtime.getStatus("frontend")).toBe(SubsystemLifecycle.READY);
    expect(runtime.getSubsystem("frontend")).toBe(frontend);
  });

  it("guards cross-subsystem calls with capability grants", () => {
    const { factory } = compose();

    factory.capabilities.allow("frontend", "backend");

    expect(factory.security.executeCall("frontend", "backend", () => 42)).toBe(42);
    expect(() => factory.security.executeCall("backend", "frontend", () => {})).toThrow(
      /Security violation/
    );
  });

  it("delivers published events and dead-letters failing subscribers", async () => {
    const { factory } = compose();
    const received: Array<{ invoiceId: string }> = [];

    factory.events.subscribe("invoice.paid", async (payload) => {
      received.push(payload);
    });
    factory.events.subscribe("invoice.paid", async () => {
      throw new Error("subscriber offline");
    });

    const allDelivered = await factory.events.publish("invoice.paid", { invoiceId: "inv_1" });

    expect(allDelivered).toBe(false);
    expect(received).toEqual([{ invoiceId: "inv_1" }]);
    expect(factory.events.getDeadLetters()).toEqual([
      expect.objectContaining({ topic: "invoice.paid", error: "subscriber offline" })
    ]);
  });

  it("surfaces unhealthy subsystems through the health manager", async () => {
    const { factory, runtime } = compose();

    factory.health.registerCheck("backend", async () => new HealthCheck("backend", true));
    factory.health.registerCheck("database", async () => {
      throw new Error("connection refused");
    });

    const report = await runtime.getHealth();

    expect(report.checks).toHaveLength(2);
    expect(report.overallHealthy).toBe(false);
    expect(report.checks.map((c) => c.name)).toContain("database");
  });

  it("drains subsystems on shutdown and boots again after dispose", async () => {
    const { factory, runtime, backend } = compose();

    await runtime.initialize("development");
    await runtime.start();

    factory.metrics.increment("transactions");
    expect(factory.metrics.get("transactions")).toBe(1);
    expect(factory.diagnostics.buildReport(["backend", "frontend"])).toContain("backend");

    expect(await runtime.shutdown()).toBe(true);
    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.STOPPED);
    expect(runtime.getStatus("frontend")).toBe(SubsystemLifecycle.STOPPED);

    runtime.dispose();
    factory.registry.register(new SubsystemDescriptor("backend", [], backend));

    await runtime.initialize("development");
    expect(await runtime.start()).toBe(true);
    expect(runtime.getStatus("backend")).toBe(SubsystemLifecycle.READY);
  });
});
