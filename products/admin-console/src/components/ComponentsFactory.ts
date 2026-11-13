import { IComponentFactory } from "./IComponentFactory.js";
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
 * ComponentsFactory composing registries and renderers, implementing IComponentFactory.
 */
export class ComponentsFactory implements IComponentFactory {
  public static createRegistry(): ComponentRegistry {
    return new ComponentRegistry();
  }

  public static createResolver(registry: ComponentRegistry): ComponentResolver {
    return new ComponentResolver(registry);
  }

  public static createCache(): ComponentCache {
    return new ComponentCache();
  }

  public static createLazyLoader(): LazyComponentLoader {
    return new LazyComponentLoader();
  }

  public static createLoader(
    resolver: ComponentResolver,
    cache: ComponentCache,
    lazyLoader: LazyComponentLoader
  ): ComponentLoader {
    return new ComponentLoader(resolver, cache, lazyLoader);
  }

  public static createRenderer(): ComponentRenderer {
    return new ComponentRenderer();
  }

  public static createComposer(): ComponentComposer {
    return new ComponentComposer();
  }

  public static createConditionalRenderer(
    checkFeatureFlag?: (flag: string) => boolean
  ): ConditionalRenderer {
    return new ConditionalRenderer(checkFeatureFlag);
  }

  public static createEventDispatcher(): ComponentEventDispatcher {
    return new ComponentEventDispatcher();
  }

  public static createObserver(dispatcher: ComponentEventDispatcher): ComponentObserver {
    return new ComponentObserver(dispatcher);
  }

  public createRegistry(): ComponentRegistry {
    return ComponentsFactory.createRegistry();
  }

  public createResolver(registry: ComponentRegistry): ComponentResolver {
    return ComponentsFactory.createResolver(registry);
  }

  public createCache(): ComponentCache {
    return ComponentsFactory.createCache();
  }

  public createLazyLoader(): LazyComponentLoader {
    return ComponentsFactory.createLazyLoader();
  }

  public createLoader(
    resolver: ComponentResolver,
    cache: ComponentCache,
    lazyLoader: LazyComponentLoader
  ): ComponentLoader {
    return ComponentsFactory.createLoader(resolver, cache, lazyLoader);
  }

  public createRenderer(): ComponentRenderer {
    return ComponentsFactory.createRenderer();
  }

  public createComposer(): ComponentComposer {
    return ComponentsFactory.createComposer();
  }

  public createConditionalRenderer(
    checkFeatureFlag?: (flag: string) => boolean
  ): ConditionalRenderer {
    return ComponentsFactory.createConditionalRenderer(checkFeatureFlag);
  }

  public createEventDispatcher(): ComponentEventDispatcher {
    return ComponentsFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: ComponentEventDispatcher): ComponentObserver {
    return ComponentsFactory.createObserver(dispatcher);
  }
}
