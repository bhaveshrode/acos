"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutDescriptor = void 0;
/**
 * LayoutDescriptor encapsulating layout metadata, class mappings, and supported regions options.
 */
class LayoutDescriptor {
    metadata;
    layoutClass;
    supportedRegions;
    constructor(metadata, layoutClass, supportedRegions = []) {
        this.metadata = metadata;
        this.layoutClass = layoutClass;
        this.supportedRegions = supportedRegions;
        Object.freeze(this.supportedRegions);
        Object.freeze(this);
    }
}
exports.LayoutDescriptor = LayoutDescriptor;
