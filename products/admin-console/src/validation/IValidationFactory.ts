import { ValidationRegistry } from "./ValidationRegistry.js";
import { ValidationResolver } from "./ValidationResolver.js";
import { ObjectValidator } from "./ObjectValidator.js";
import { ValidationPipeline } from "./ValidationPipeline.js";
import { ValidationEventDispatcher } from "./ValidationEventDispatcher.js";
import { ValidationObserver } from "./ValidationObserver.js";

/**
 * IValidationFactory interface defining validation composition roots contract.
 */
export interface IValidationFactory {
  createRegistry(): ValidationRegistry;
  createResolver(registry: ValidationRegistry): ValidationResolver;
  createObjectValidator(): ObjectValidator;
  createPipeline(objectValidator: ObjectValidator): ValidationPipeline;
  createEventDispatcher(): ValidationEventDispatcher;
  createObserver(dispatcher: ValidationEventDispatcher): ValidationObserver;
}
