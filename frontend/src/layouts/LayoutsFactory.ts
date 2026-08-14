import { ILayoutFactory } from "./ILayoutFactory.js";
import { LayoutRegistry } from "./LayoutRegistry.js";
import { LayoutResolver } from "./LayoutResolver.js";
import { LayoutComposer } from "./LayoutComposer.js";
import { LayoutRenderer } from "./LayoutRenderer.js";
import { ResponsiveLayoutManager } from "./ResponsiveLayoutManager.js";
import { LayoutStateManager } from "./LayoutStateManager.js";
import { LayoutEventDispatcher } from "./LayoutEventDispatcher.js";
import { LayoutObserver } from "./LayoutObserver.js";

/**
 * LayoutsFactory implementing composition interfaces contracts.
 */
export class LayoutsFactory implements ILayoutFactory {
  public static createRegistry(): LayoutRegistry {
    return new LayoutRegistry();
  }

  public static createResolver(registry: LayoutRegistry): LayoutResolver {
    return new LayoutResolver(registry);
  }

  public static createComposer(): LayoutComposer {
    return new LayoutComposer();
  }

  public static createRenderer(): LayoutRenderer {
    return new LayoutRenderer();
  }

  public static createResponsiveManager(): ResponsiveLayoutManager {
    return new ResponsiveLayoutManager();
  }

  public static createStateManager(): LayoutStateManager {
    return new LayoutStateManager();
  }

  public static createEventDispatcher(): LayoutEventDispatcher {
    return new LayoutEventDispatcher();
  }

  public static createObserver(dispatcher: LayoutEventDispatcher): LayoutObserver {
    return new LayoutObserver(dispatcher);
  }

  public createRegistry(): LayoutRegistry {
    return LayoutsFactory.createRegistry();
  }

  public createResolver(registry: LayoutRegistry): LayoutResolver {
    return LayoutsFactory.createResolver(registry);
  }

  public createComposer(): LayoutComposer {
    return LayoutsFactory.createComposer();
  }

  public createRenderer(): LayoutRenderer {
    return LayoutsFactory.createRenderer();
  }

  public createResponsiveManager(): ResponsiveLayoutManager {
    return LayoutsFactory.createResponsiveManager();
  }

  public createStateManager(): LayoutStateManager {
    return LayoutsFactory.createStateManager();
  }

  public createEventDispatcher(): LayoutEventDispatcher {
    return LayoutsFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: LayoutEventDispatcher): LayoutObserver {
    return LayoutsFactory.createObserver(dispatcher);
  }
}
