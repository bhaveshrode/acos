import { describe, it, expect, beforeEach, vi } from "vitest";
import { FactoryContext } from "../FactoryContext.js";
import { FactoryDescriptor } from "../FactoryDescriptor.js";
import { FactoryRegistry } from "../FactoryRegistry.js";
import { FactoryResolver } from "../FactoryResolver.js";
import { FrontendFactory } from "../FrontendFactory.js";
import { DependencyComposer } from "../DependencyComposer.js";
import { FactoryPipeline } from "../FactoryPipeline.js";
import { FactoryValidator } from "../FactoryValidator.js";
import { FactoryLifecycleManager } from "../FactoryLifecycleManager.js";
import { FactoryLifecycleEvent } from "../FactoryLifecycleEvent.js";
import { FactoryEventDispatcher } from "../FactoryEventDispatcher.js";
import { FactoryObserver } from "../FactoryObserver.js";

class DummyFactory {}

describe("Frontend Factories Component Unit Tests (Task 78.7)", () => {
  let context: FactoryContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    context = new FactoryContext();
  });

  describe("Contexts & Models", () => {
    it("should instantiate FactoryContext and freeze properties", () => {
      const services = new Map<string, any>([["auth", {}]]);
      const providers = new Map<string, any>([["api", {}]]);
      const ctx = new FactoryContext(services, providers, { apiBase: "test" }, { ver: "1" });

      expect(ctx.applicationServices.has("auth")).toBe(true);
      expect(ctx.dependencyProviders.has("api")).toBe(true);
      expect(ctx.configurationSnapshot.apiBase).toBe("test");
      expect(ctx.compositionMetadata.ver).toBe("1");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.applicationServices)).toBe(true);
      expect(Object.isFrozen(ctx.dependencyProviders)).toBe(true);
      expect(Object.isFrozen(ctx.configurationSnapshot)).toBe(true);
      expect(Object.isFrozen(ctx.compositionMetadata)).toBe(true);
    });
  });

  describe("Registry & Resolution", () => {
    it("should register factory descriptors and freeze FactoryRegistry", () => {
      const registry = new FactoryRegistry();
      const descriptor = new FactoryDescriptor("dummy", DummyFactory, ["core"], { version: "1.0" });

      registry.register(descriptor);
      expect(registry.get("dummy")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "FactoryRegistry is frozen and cannot accept further factories"
      );
    });

    it("should resolve descriptors using FactoryResolver", () => {
      const registry = new FactoryRegistry();
      const descriptor = new FactoryDescriptor("dummy", DummyFactory);
      registry.register(descriptor);

      const resolver = new FactoryResolver(registry);
      expect(resolver.resolve("dummy")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Factory with identifier missing is not registered"
      );
    });
  });

  describe("Composition Root", () => {
    it("should resolve subcomponent factories in FrontendFactory root gateway", () => {
      const root = new FrontendFactory();
      expect(root.app).toBeDefined();
      expect(root.configuration).toBeDefined();
      expect(root.theme).toBeDefined();
      expect(root.routing).toBeDefined();
      expect(root.api).toBeDefined();
      expect(root.state).toBeDefined();
      expect(root.authentication).toBeDefined();
      expect(root.authorization).toBeDefined();
      expect(root.components).toBeDefined();
      expect(root.layouts).toBeDefined();
      expect(root.forms).toBeDefined();
      expect(root.validation).toBeDefined();
      expect(root.pages).toBeDefined();
      expect(root.notifications).toBeDefined();
      expect(root.workflow).toBeDefined();
      expect(root.analytics).toBeDefined();
      expect(root.websocket).toBeDefined();
    });
  });

  describe("Dependency Composition & Pipelines", () => {
    it("should manage maps in DependencyComposer", () => {
      const composer = new DependencyComposer();
      composer.registerDependency("auth", ["api", "state"]);
      expect(composer.getDependencies("auth")).toEqual(["api", "state"]);
    });

    it("should execute initialization sequential hooks in FactoryPipeline", () => {
      const pipeline = new FactoryPipeline();
      const order: string[] = [];

      pipeline.addFactory("api", () => order.push("api-init"));
      pipeline.addFactory("auth", () => order.push("auth-init"));

      pipeline.run();
      expect(order).toEqual(["api-init", "auth-init"]);
    });

    it("should validate circularities and missing nodes in FactoryValidator", () => {
      const validator = new FactoryValidator();
      const graph = new Map<string, string[]>();

      graph.set("a", ["b"]);
      graph.set("b", ["c"]);
      graph.set("c", ["a"]); // Circular cycle

      const errors = validator.validate(graph);
      expect(errors.some((err) => err.includes("Circular dependency detected"))).toBe(true);

      const missingGraph = new Map<string, string[]>();
      missingGraph.set("x", ["y"]); // y is missing from registry keys
      const missingErrors = validator.validate(missingGraph);
      expect(missingErrors.some((err) => err.includes("Missing dependency: y"))).toBe(true);
    });

    it("should run cleanups in FactoryLifecycleManager", () => {
      const manager = new FactoryLifecycleManager();
      let cleaned = false;

      manager.registerCleanup(() => {
        cleaned = true;
      });

      manager.dispose();
      expect(cleaned).toBe(true);
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe composition lifecycle events", () => {
      const dispatcher = new FactoryEventDispatcher();
      const observer = new FactoryObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.factoryId).toBe("auth-factory");
        expect(ev.type).toBe("composition");
      });

      dispatcher.dispatch(new FactoryLifecycleEvent("auth-factory", "composition"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new FactoryLifecycleEvent("auth-factory", "composition"));
      expect(count).toBe(1);
    });
  });
});
