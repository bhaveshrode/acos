"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerFactory = void 0;
const ContainerImage_js_1 = require("./ContainerImage.js");
const ContainerInstance_js_1 = require("./ContainerInstance.js");
const ContainerDescriptor_js_1 = require("./ContainerDescriptor.js");
const ContainerRegistry_js_1 = require("./ContainerRegistry.js");
const ContainerBuilder_js_1 = require("./ContainerBuilder.js");
/**
 * ContainerFactory creating images and instances.
 */
class ContainerFactory {
    static createImage(name, tag) {
        return new ContainerImage_js_1.ContainerImage(name, tag);
    }
    static createInstance(instanceId, state) {
        return new ContainerInstance_js_1.ContainerInstance(instanceId, state);
    }
    static createDescriptor(id, image, instance, envVars) {
        return new ContainerDescriptor_js_1.ContainerDescriptor(id, image, instance, envVars);
    }
    static createRegistry() {
        return new ContainerRegistry_js_1.ContainerRegistry();
    }
    static createBuilder() {
        return new ContainerBuilder_js_1.ContainerBuilder();
    }
    createImage(name, tag) {
        return ContainerFactory.createImage(name, tag);
    }
    createInstance(instanceId, state) {
        return ContainerFactory.createInstance(instanceId, state);
    }
    createDescriptor(id, image, instance, envVars) {
        return ContainerFactory.createDescriptor(id, image, instance, envVars);
    }
    createRegistry() {
        return ContainerFactory.createRegistry();
    }
    createBuilder() {
        return ContainerFactory.createBuilder();
    }
}
exports.ContainerFactory = ContainerFactory;
