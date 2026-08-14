import { LayoutRegistry } from "./LayoutRegistry.js";
import { LayoutResolver } from "./LayoutResolver.js";
import { LayoutComposer } from "./LayoutComposer.js";
import { LayoutRenderer } from "./LayoutRenderer.js";
import { ResponsiveLayoutManager } from "./ResponsiveLayoutManager.js";
import { LayoutStateManager } from "./LayoutStateManager.js";
import { LayoutEventDispatcher } from "./LayoutEventDispatcher.js";
import { LayoutObserver } from "./LayoutObserver.js";

/**
 * ILayoutFactory contract interface defining layout composition capability sets.
 */
export interface ILayoutFactory {
  createRegistry(): LayoutRegistry;
  createResolver(registry: LayoutRegistry): LayoutResolver;
  createComposer(): LayoutComposer;
  createRenderer(): LayoutRenderer;
  createResponsiveManager(): ResponsiveLayoutManager;
  createStateManager(): LayoutStateManager;
  createEventDispatcher(): LayoutEventDispatcher;
  createObserver(dispatcher: LayoutEventDispatcher): LayoutObserver;
}
