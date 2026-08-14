"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuMonitor = void 0;
/**
 * CpuMonitor implementing IMonitor interface.
 */
class CpuMonitor {
    getMetricName() {
        return "cpu_load";
    }
    getUsage() {
        return 15;
    }
}
exports.CpuMonitor = CpuMonitor;
