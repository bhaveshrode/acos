"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsDescriptor = void 0;
/**
 * AnalyticsDescriptor wrapping provider constructors and supported categories.
 */
class AnalyticsDescriptor {
    metadata;
    providerClass;
    supportedCategories;
    constructor(metadata, providerClass, supportedCategories = []) {
        this.metadata = metadata;
        this.providerClass = providerClass;
        this.supportedCategories = supportedCategories;
        Object.freeze(this.supportedCategories);
        Object.freeze(this);
    }
}
exports.AnalyticsDescriptor = AnalyticsDescriptor;
