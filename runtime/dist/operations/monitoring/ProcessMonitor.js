"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessMonitor = void 0;
/**
 * ProcessMonitor implementing IMonitor interface.
 */
class ProcessMonitor {
    getMetricName() {
        return "process_count";
    }
    getUsage() {
        return 120;
    }
}
exports.ProcessMonitor = ProcessMonitor;
