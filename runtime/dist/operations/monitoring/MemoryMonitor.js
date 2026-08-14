"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMonitor = void 0;
/**
 * MemoryMonitor implementing IMonitor interface.
 */
class MemoryMonitor {
    getMetricName() {
        return "memory_load";
    }
    getUsage() {
        return 45;
    }
}
exports.MemoryMonitor = MemoryMonitor;
