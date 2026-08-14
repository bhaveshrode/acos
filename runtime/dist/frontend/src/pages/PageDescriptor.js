"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageDescriptor = void 0;
/**
 * PageDescriptor wrapping page constructor classes and layout dependencies.
 */
class PageDescriptor {
    metadata;
    pageClass;
    layoutId;
    constructor(metadata, pageClass, layoutId) {
        this.metadata = metadata;
        this.pageClass = pageClass;
        this.layoutId = layoutId;
        Object.freeze(this);
    }
}
exports.PageDescriptor = PageDescriptor;
