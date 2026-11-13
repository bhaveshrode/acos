import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClaimsPrincipal } from "../../authentication/ClaimsPrincipal.js";
import { ComponentState } from "../ComponentState.js";
import { ComponentMetadata } from "../ComponentMetadata.js";
import { ComponentContext } from "../ComponentContext.js";
import { IComponent } from "../IComponent.js";
import { BaseComponent } from "../BaseComponent.js";
import { ComponentDescriptor } from "../ComponentDescriptor.js";
import { ComponentRegistry } from "../ComponentRegistry.js";
import { ComponentResolver } from "../ComponentResolver.js";
import { ComponentCache } from "../ComponentCache.js";
import { LazyComponentLoader } from "../LazyComponentLoader.js";
import { ComponentLoader } from "../ComponentLoader.js";
import { RenderResult } from "../RenderResult.js";
import { ComponentRenderer } from "../ComponentRenderer.js";
import { ComponentSlot } from "../ComponentSlot.js";
import { ComponentComposer } from "../ComponentComposer.js";
import { ConditionalRenderer } from "../ConditionalRenderer.js";
import { ComponentLifecycleEvent } from "../ComponentLifecycleEvent.js";
import { ComponentEvent } from "../ComponentEvent.js";
import { ComponentEventDispatcher } from "../ComponentEventDispatcher.js";
import { ComponentObserver } from "../ComponentObserver.js";
import { ComponentsFactory } from "../ComponentsFactory.js";
import { PageLayout } from "../PageLayout.js";
import { DashboardLayout } from "../DashboardLayout.js";
import { FormLayout } from "../FormLayout.js";
import { DialogLayout } from "../DialogLayout.js";
import { SidebarLayout } from "../SidebarLayout.js";
import { ButtonComponent } from "../ButtonComponent.js";
import { InputComponent } from "../InputComponent.js";
import { TableComponent } from "../TableComponent.js";
import { CardComponent } from "../CardComponent.js";
import { BadgeComponent } from "../BadgeComponent.js";
import { ModalComponent } from "../ModalComponent.js";
import { LoadingComponent } from "../LoadingComponent.js";
import { EmptyStateComponent } from "../EmptyStateComponent.js";

class TestComponent extends BaseComponent<{ title: string }> {
  public render(): string {
    return `<div class="test">${this.props.title}</div>`;
  }
}

describe("Frontend Components Component Refactored Unit Tests (Task 69.9)", () => {
  let context: ComponentContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    const meta: ComponentMetadata = { id: "test-c" };
    context = new ComponentContext(meta, { configService: {} });
  });

  describe("Contexts & Models", () => {
    it("should instantiate ComponentContext and deep freeze arrays", () => {
      const meta: ComponentMetadata = { id: "test-id", permissions: ["view"] };
      const ctx = new ComponentContext(meta, { auth: {} });

      expect(ctx.metadata.id).toBe("test-id");
      expect(ctx.services).toHaveProperty("auth");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.services)).toBe(true);
    });

    it("should maintain state values correctly", () => {
      const comp = new TestComponent(context, { title: "Hello" });
      expect(comp.state).toBe(ComponentState.Created);

      comp.mount({});
      expect(comp.state).toBe(ComponentState.Mounted);

      comp.update({ title: "Updated" });
      expect(comp.state).toBe(ComponentState.Mounted);

      comp.unmount();
      expect(comp.state).toBe(ComponentState.Unmounted);
    });
  });

  describe("Base Components & Registry", () => {
    it("should catalog descriptors and support registry freezing", () => {
      const registry = new ComponentRegistry();
      const meta: ComponentMetadata = { id: "test-widget" };
      const descriptor = new ComponentDescriptor(meta, TestComponent, ["header"]);

      registry.register(descriptor);
      expect(registry.get("test-widget")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "ComponentRegistry is frozen and cannot accept further components"
      );
    });

    it("should resolve descriptors in ComponentResolver", () => {
      const registry = new ComponentRegistry();
      const meta: ComponentMetadata = { id: "test-widget" };
      const descriptor = new ComponentDescriptor(meta, TestComponent, ["header"]);
      registry.register(descriptor);

      const resolver = new ComponentResolver(registry);
      expect(resolver.resolve("test-widget")).toBe(descriptor);

      expect(() => resolver.resolve("missing")).toThrow(
        "Component with identifier missing is not registered"
      );
    });
  });

  describe("Layout Components", () => {
    it("should render PageLayout structure", () => {
      const page = new PageLayout(context, { title: "Portal", children: "<span>Body</span>" });
      const html = page.render();
      expect(html).toContain('<div class="page-layout">');
      expect(html).toContain("<h1>Portal</h1>");
      expect(html).toContain("<span>Body</span>");
    });

    it("should render DashboardLayout structure", () => {
      const layout = new DashboardLayout(context, { title: "Sales", children: "<div>Widget</div>" });
      const html = layout.render();
      expect(html).toContain("Sales Dashboard");
      expect(html).toContain("<div>Widget</div>");
    });
  });

  describe("Shared UI Widgets", () => {
    it("should render ButtonComponent", () => {
      const btn = new ButtonComponent(context, { label: "Click Me", disabled: true });
      expect(btn.render()).toBe('<button class="btn" disabled>Click Me</button>');
    });

    it("should render InputComponent", () => {
      const input = new InputComponent(context, { value: "ACOS", placeholder: "Type...", type: "password" });
      expect(input.render()).toBe('<input type="password" value="ACOS" placeholder="Type..." class="input" />');
    });
  });

  describe("Dynamic Rendering", () => {
    it("should load synchronous and asynchronous components inside ComponentLoader", async () => {
      const registry = new ComponentRegistry();
      const meta: ComponentMetadata = { id: "btn" };
      registry.register(new ComponentDescriptor(meta, ButtonComponent));

      const resolver = new ComponentResolver(registry);
      const cache = new ComponentCache();
      const lazyLoader = new LazyComponentLoader();
      const loader = new ComponentLoader(resolver, cache, lazyLoader);

      const syncRes = loader.loadSync("btn");
      expect(syncRes).toBe(ButtonComponent);

      const mockImport = async () => ({ default: TestComponent });
      const asyncRes = await loader.loadAsync("test-lazy", mockImport);
      expect(asyncRes).toBe(TestComponent);
    });

    it("should render resolved component outputs in ComponentRenderer returning RenderResult", () => {
      const renderer = new ComponentRenderer();
      const comp = new TestComponent(context, { title: "RenderTest" });
      const res = renderer.render(comp);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toBe('<div class="test">RenderTest</div>');
      expect(res.duration).toBeGreaterThanOrEqual(0);
      expect(res.diagnostics.componentId).toBe("test-c");
    });
  });

  describe("Composition & Slots", () => {
    it("should replace layout slot placeholders inside ComponentComposer", () => {
      class SlotLayout extends BaseComponent<{}> {
        public render(): string {
          return `<div class="layout"><!-- slot:header --><main><!-- slot:content --></main></div>`;
        }
      }

      const layout = new SlotLayout(context, {});
      const composer = new ComponentComposer();
      const html = composer.compose(layout, {
        header: "<header>Banner</header>",
        content: "<p>Main view</p>"
      });

      expect(html).toBe('<div class="layout"><header>Banner</header><main><p>Main view</p></main></div>');
    });

    it("should evaluate shouldRender constraints inside ConditionalRenderer", () => {
      const checkFlag = vi.fn().mockImplementation((f) => f === "enabled-flag");
      const cond = new ConditionalRenderer(checkFlag);

      const metaTrue: ComponentMetadata = { id: "c-1", featureFlags: ["enabled-flag"], permissions: ["read:*"] };
      const metaFalse: ComponentMetadata = { id: "c-2", featureFlags: ["disabled-flag"] };

      const user = new ClaimsPrincipal("u-1", { role: "user" });

      expect(cond.shouldRender(metaTrue, user)).toBe(true);
      expect(cond.shouldRender(metaFalse, user)).toBe(false);
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe component lifecycle events", () => {
      const dispatcher = new ComponentEventDispatcher();
      const observer = new ComponentObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.componentId).toBe("test-comp-1");
        expect(ev.type).toBe("mounted");
      });

      dispatcher.dispatch(new ComponentEvent("test-comp-1", "mounted"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new ComponentEvent("test-comp-1", "mounted"));
      expect(count).toBe(1);
    });
  });
});
