"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRefreshManager = void 0;
/**
 * PageRefreshManager triggering reload and refetch logic.
 */
class PageRefreshManager {
    async refresh(page) {
        await page.loadData();
    }
}
exports.PageRefreshManager = PageRefreshManager;
