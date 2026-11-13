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
 * IFormFactory contract interface defining form components composition roots capabilities.
 */
export interface IFormFactory {
  createRegistry(): FormRegistry;
  createResolver(registry: FormRegistry): FormResolver;
  createCache(): FormCache;
  createLazyLoader(): LazyFormLoader;
  createLoader(
    resolver: FormResolver,
    cache: FormCache,
    lazyLoader: LazyFormLoader
  ): FormLoader;
  createRenderer(): FormRenderer;
  createEventDispatcher(): FormEventDispatcher;
  createObserver(dispatcher: FormEventDispatcher): FormObserver;
  createBinder(): FormBinder;
  createValidator(): FormValidator;
  createStateManager(): FormStateManager;
  createSerializer(): FormSerializer;
  createDraftManager(serializer: FormSerializer): DraftManager;
  createHydrator(serializer: FormSerializer, draftManager: DraftManager): FormHydrator;
}
