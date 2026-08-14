/**
 * SubsystemRegistry cataloging ACOS subsystems.
 */
export class SubsystemRegistry {
    subsystems = new Map();
    register(descriptor) {
        this.subsystems.set(descriptor.name.toLowerCase(), descriptor);
    }
    get(name) {
        return this.subsystems.get(name.toLowerCase());
    }
    list() {
        return Array.from(this.subsystems.values());
    }
    clear() {
        this.subsystems.clear();
    }
}
