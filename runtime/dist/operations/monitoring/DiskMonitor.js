"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskMonitor = void 0;
/**
 * DiskMonitor implementing IMonitor interface.
 */
class DiskMonitor {
    getMetricName() {
        return "disk_load";
    }
    getUsage() {
        return 60;
    }
}
exports.DiskMonitor = DiskMonitor;
