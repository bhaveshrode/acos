"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationMonitoringFactory = void 0;
const IntegrationHealthManager_js_1 = require("./IntegrationHealthManager.js");
/**
 * IntegrationMonitoringFactory constructing health monitoring managers.
 */
class IntegrationMonitoringFactory {
    static createHealthManager() {
        return new IntegrationHealthManager_js_1.IntegrationHealthManager();
    }
    createHealthManager() {
        return IntegrationMonitoringFactory.createHealthManager();
    }
}
exports.IntegrationMonitoringFactory = IntegrationMonitoringFactory;
