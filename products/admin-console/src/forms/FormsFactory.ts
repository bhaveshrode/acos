import { IFormFactory } from "./IFormFactory.js";
import { FormRegistry } from "./FormRegistry.js";
import { FormResolver } from "./FormResolver.js";
import { FormCache } from "./FormCache.js";
import { LazyFormLoader } from "./LazyFormLoader.js";
import { FormLoader } from "./FormLoader.js";
import { FormRenderer } from "./FormRenderer.js";
import { FormEventDispatcher } from "./FormEventDispatcher.js";
import { FormObserver } from "./FormObserver.js";
import { FormBinder } from "./FormBinder.js";
import { FormValidator } from "./FormValidator.js";
import { FormStateManager } from "./FormStateManager.js";
import { FormSerializer } from "./FormSerializer.js";
import { DraftManager } from "./DraftManager.js";
import { FormHydrator } from "./FormHydrator.js";

/**
 * FormsFactory composing loaders, validators, observers, and draft managers, implementing IFormFactory.
 */
export class FormsFactory implements IFormFactory {
  public static createRegistry(): FormRegistry {
    return new FormRegistry();
  }

  public static createResolver(registry: FormRegistry): FormResolver {
    return new FormResolver(registry);
  }

  public static createCache(): FormCache {
    return new FormCache();
  }

  public static createLazyLoader(): LazyFormLoader {
    return new LazyFormLoader();
  }

  public static createLoader(
    resolver: FormResolver,
    cache: FormCache,
    lazyLoader: LazyFormLoader
  ): FormLoader {
    return new FormLoader(resolver, cache, lazyLoader);
  }

  public static createRenderer(): FormRenderer {
    return new FormRenderer();
  }

  public static createEventDispatcher(): FormEventDispatcher {
    return new FormEventDispatcher();
  }

  public static createObserver(dispatcher: FormEventDispatcher): FormObserver {
    return new FormObserver(dispatcher);
  }

  public static createBinder(): FormBinder {
    return new FormBinder();
  }

  public static createValidator(): FormValidator {
    return new FormValidator();
  }

  public static createStateManager(): FormStateManager {
    return new FormStateManager();
  }

  public static createSerializer(): FormSerializer {
    return new FormSerializer();
  }

  public static createDraftManager(serializer: FormSerializer): DraftManager {
    return new DraftManager(serializer);
  }

  public static createHydrator(serializer: FormSerializer, draftManager: DraftManager): FormHydrator {
    return new FormHydrator(serializer, draftManager);
  }

  public createRegistry(): FormRegistry {
    return FormsFactory.createRegistry();
  }

  public createResolver(registry: FormRegistry): FormResolver {
    return FormsFactory.createResolver(registry);
  }

  public createCache(): FormCache {
    return FormsFactory.createCache();
  }

  public createLazyLoader(): LazyFormLoader {
    return FormsFactory.createLazyLoader();
  }

  public createLoader(
    resolver: FormResolver,
    cache: FormCache,
    lazyLoader: LazyFormLoader
  ): FormLoader {
    return FormsFactory.createLoader(resolver, cache, lazyLoader);
  }

  public createRenderer(): FormRenderer {
    return FormsFactory.createRenderer();
  }

  public createEventDispatcher(): FormEventDispatcher {
    return FormsFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: FormEventDispatcher): FormObserver {
    return FormsFactory.createObserver(dispatcher);
  }

  public createBinder(): FormBinder {
    return FormsFactory.createBinder();
  }

  public createValidator(): FormValidator {
    return FormsFactory.createValidator();
  }

  public createStateManager(): FormStateManager {
    return FormsFactory.createStateManager();
  }

  public createSerializer(): FormSerializer {
    return FormsFactory.createSerializer();
  }

  public createDraftManager(serializer: FormSerializer): DraftManager {
    return FormsFactory.createDraftManager(serializer);
  }

  public createHydrator(serializer: FormSerializer, draftManager: DraftManager): FormHydrator {
    return FormsFactory.createHydrator(serializer, draftManager);
  }
}
