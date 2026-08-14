"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationFactory = void 0;
const ValidationRegistry_js_1 = require("./ValidationRegistry.js");
const ValidationResolver_js_1 = require("./ValidationResolver.js");
const ObjectValidator_js_1 = require("./ObjectValidator.js");
const ValidationPipeline_js_1 = require("./ValidationPipeline.js");
const ValidationEventDispatcher_js_1 = require("./ValidationEventDispatcher.js");
const ValidationObserver_js_1 = require("./ValidationObserver.js");
/**
 * ValidationFactory implementing standard IValidationFactory composition roots.
 */
class ValidationFactory {
    static createRegistry() {
        return new ValidationRegistry_js_1.ValidationRegistry();
    }
    static createResolver(registry) {
        return new ValidationResolver_js_1.ValidationResolver(registry);
    }
    static createObjectValidator() {
        return new ObjectValidator_js_1.ObjectValidator();
    }
    static createPipeline(objectValidator) {
        return new ValidationPipeline_js_1.ValidationPipeline(objectValidator);
    }
    static createEventDispatcher() {
        return new ValidationEventDispatcher_js_1.ValidationEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new ValidationObserver_js_1.ValidationObserver(dispatcher);
    }
    createRegistry() {
        return ValidationFactory.createRegistry();
    }
    createResolver(registry) {
        return ValidationFactory.createResolver(registry);
    }
    createObjectValidator() {
        return ValidationFactory.createObjectValidator();
    }
    createPipeline(objectValidator) {
        return ValidationFactory.createPipeline(objectValidator);
    }
    createEventDispatcher() {
        return ValidationFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return ValidationFactory.createObserver(dispatcher);
    }
}
exports.ValidationFactory = ValidationFactory;
