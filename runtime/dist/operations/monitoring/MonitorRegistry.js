"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorRegistry = void 0;
/**
 * MonitorRegistry cataloging resource monitors.
 */
class MonitorRegistry {
    catalog = new Map();
    register(name, monitor) {
        this.catalog.set(name, monitor);
    }
    get(name) {
        return this.catalog.get(name);
    }
}
exports.MonitorRegistry = MonitorRegistry;
