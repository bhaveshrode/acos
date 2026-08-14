"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationHealthManager = void 0;
/**
 * IntegrationHealthManager tracking provider statuses and checking SaaS connectivity.
 */
class IntegrationHealthManager {
    providerStatuses = new Map();
    setStatus(provider, status) {
        this.providerStatuses.set(provider.toLowerCase(), status);
    }
    getStatus(provider) {
        return this.providerStatuses.get(provider.toLowerCase()) || "Unknown";
    }
    async checkConnectivity(provider, pingFn) {
        try {
            const active = await pingFn();
            const status = active ? "Healthy" : "Unhealthy";
            this.setStatus(provider, status);
            return status;
        }
        catch {
            this.setStatus(provider, "Unhealthy");
            return "Unhealthy";
        }
    }
}
exports.IntegrationHealthManager = IntegrationHealthManager;
