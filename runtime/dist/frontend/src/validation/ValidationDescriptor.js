"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationDescriptor = void 0;
/**
 * ValidationDescriptor encapsulating schemas and metadata.
 */
class ValidationDescriptor {
    id;
    schema;
    metadata;
    constructor(id, schema, metadata = {}) {
        this.id = id;
        this.schema = schema;
        this.metadata = metadata;
        Object.freeze(this.metadata);
        Object.freeze(this);
    }
}
exports.ValidationDescriptor = ValidationDescriptor;
