"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringFactory = void 0;
const CpuMonitor_js_1 = require("./CpuMonitor.js");
const MemoryMonitor_js_1 = require("./MemoryMonitor.js");
const DiskMonitor_js_1 = require("./DiskMonitor.js");
const ProcessMonitor_js_1 = require("./ProcessMonitor.js");
const MonitorRegistry_js_1 = require("./MonitorRegistry.js");
/**
 * MonitoringFactory building resource monitors and registry helpers.
 */
class MonitoringFactory {
    static createCpuMonitor() {
        return new CpuMonitor_js_1.CpuMonitor();
    }
    static createMemoryMonitor() {
        return new MemoryMonitor_js_1.MemoryMonitor();
    }
    static createDiskMonitor() {
        return new DiskMonitor_js_1.DiskMonitor();
    }
    static createProcessMonitor() {
        return new ProcessMonitor_js_1.ProcessMonitor();
    }
    static createRegistry() {
        return new MonitorRegistry_js_1.MonitorRegistry();
    }
    createCpuMonitor() {
        return MonitoringFactory.createCpuMonitor();
    }
    createMemoryMonitor() {
        return MonitoringFactory.createMemoryMonitor();
    }
    createDiskMonitor() {
        return MonitoringFactory.createDiskMonitor();
    }
    createProcessMonitor() {
        return MonitoringFactory.createProcessMonitor();
    }
    createRegistry() {
        return MonitoringFactory.createRegistry();
    }
}
exports.MonitoringFactory = MonitoringFactory;
