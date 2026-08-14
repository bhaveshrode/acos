"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageDataLoader = void 0;
/**
 * PageDataLoader resolving data requirements before page mount activations.
 */
class PageDataLoader {
    async loadData(params) {
        return { loadedAt: Date.now(), ...params };
    }
}
exports.PageDataLoader = PageDataLoader;
