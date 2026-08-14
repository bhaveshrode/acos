/**
 * CapabilityRegistry cataloging permitted subsystem boundaries.
 */
export class CapabilityRegistry {
    capabilities = new Map();
    allow(subsystem, targetSubsystem) {
        const key = subsystem.toLowerCase();
        if (!this.capabilities.has(key)) {
            this.capabilities.set(key, new Set());
        }
        this.capabilities.get(key).add(targetSubsystem.toLowerCase());
    }
    canCall(subsystem, targetSubsystem) {
        const key = subsystem.toLowerCase();
        const target = targetSubsystem.toLowerCase();
        return this.capabilities.get(key)?.has(target) ?? false;
    }
    clear() {
        this.capabilities.clear();
    }
}
