"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentDescriptor = void 0;
/**
 * ComponentDescriptor encapsulating component class registrations, metadata, and slot configuration maps.
 */
class ComponentDescriptor {
    metadata;
    componentClass;
    slots;
    constructor(metadata, componentClass, slots = []) {
        this.metadata = metadata;
        this.componentClass = componentClass;
        this.slots = slots;
        Object.freeze(this.slots);
        Object.freeze(this);
    }
}
exports.ComponentDescriptor = ComponentDescriptor;
