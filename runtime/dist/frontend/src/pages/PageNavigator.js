"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageNavigator = void 0;
/**
 * PageNavigator managing page transitions.
 */
class PageNavigator {
    resolver;
    cache;
    activePageId;
    constructor(resolver, cache) {
        this.resolver = resolver;
        this.cache = cache;
    }
    navigateTo(pageId) {
        const descriptor = this.resolver.resolve(pageId);
        this.activePageId = descriptor.metadata.id;
        return this.activePageId;
    }
    getActivePageId() {
        return this.activePageId;
    }
}
exports.PageNavigator = PageNavigator;
