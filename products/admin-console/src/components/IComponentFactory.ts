import { ComponentRegistry } from "./ComponentRegistry.js";
import { ComponentResolver } from "./ComponentResolver.js";
import { ComponentCache } from "./ComponentCache.js";
import { LazyComponentLoader } from "./LazyComponentLoader.js";
import { ComponentLoader } from "./ComponentLoader.js";
import { ComponentRenderer } from "./ComponentRenderer.js";
import { ComponentComposer } from "./ComponentComposer.js";
import { ConditionalRenderer } from "./ConditionalRenderer.js";
import { ComponentEventDispatcher } from "./ComponentEventDispatcher.js";
import { ComponentObserver } from "./ComponentObserver.js";

/**
 * IComponentFactory interface defining components composition roots capabilities.
 */
export interface IComponentFactory {
  createRegistry(): ComponentRegistry;
  createResolver(registry: ComponentRegistry): ComponentResolver;
  createCache(): ComponentCache;
  createLazyLoader(): LazyComponentLoader;
  createLoader(
    resolver: ComponentResolver,
    cache: ComponentCache,
    lazyLoader: LazyComponentLoader
  ): ComponentLoader;
  createRenderer(): ComponentRenderer;
  createComposer(): ComponentComposer;
  createConditionalRenderer(checkFeatureFlag?: (flag: string) => boolean): ConditionalRenderer;
  createEventDispatcher(): ComponentEventDispatcher;
  createObserver(dispatcher: ComponentEventDispatcher): ComponentObserver;
}
