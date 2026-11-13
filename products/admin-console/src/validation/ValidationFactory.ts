import { IValidationFactory } from "./IValidationFactory.js";
import { ValidationRegistry } from "./ValidationRegistry.js";
import { ValidationResolver } from "./ValidationResolver.js";
import { ObjectValidator } from "./ObjectValidator.js";
import { ValidationPipeline } from "./ValidationPipeline.js";
import { ValidationEventDispatcher } from "./ValidationEventDispatcher.js";
import { ValidationObserver } from "./ValidationObserver.js";

/**
 * ValidationFactory implementing standard IValidationFactory composition roots.
 */
export class ValidationFactory implements IValidationFactory {
  public static createRegistry(): ValidationRegistry {
    return new ValidationRegistry();
  }

  public static createResolver(registry: ValidationRegistry): ValidationResolver {
    return new ValidationResolver(registry);
  }

  public static createObjectValidator(): ObjectValidator {
    return new ObjectValidator();
  }

  public static createPipeline(objectValidator: ObjectValidator): ValidationPipeline {
    return new ValidationPipeline(objectValidator);
  }

  public static createEventDispatcher(): ValidationEventDispatcher {
    return new ValidationEventDispatcher();
  }

  public static createObserver(dispatcher: ValidationEventDispatcher): ValidationObserver {
    return new ValidationObserver(dispatcher);
  }

  public createRegistry(): ValidationRegistry {
    return ValidationFactory.createRegistry();
  }

  public createResolver(registry: ValidationRegistry): ValidationResolver {
    return ValidationFactory.createResolver(registry);
  }

  public createObjectValidator(): ObjectValidator {
    return ValidationFactory.createObjectValidator();
  }

  public createPipeline(objectValidator: ObjectValidator): ValidationPipeline {
    return ValidationFactory.createPipeline(objectValidator);
  }

  public createEventDispatcher(): ValidationEventDispatcher {
    return ValidationFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: ValidationEventDispatcher): ValidationObserver {
    return ValidationFactory.createObserver(dispatcher);
  }
}
