"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerDescriptor = void 0;
/**
 * ContainerDescriptor grouping image definitions and running instances metadata.
 */
class ContainerDescriptor {
    id;
    image;
    instance;
    envVars;
    constructor(id, image, instance, envVars = {}) {
        this.id = id;
        this.image = image;
        this.instance = instance;
        this.envVars = envVars;
        Object.freeze(this.envVars);
        Object.freeze(this);
    }
}
exports.ContainerDescriptor = ContainerDescriptor;
