/**
 * SubsystemResolver resolving registered instances.
 */
export class SubsystemResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolveFactory(name) {
        const desc = this.registry.get(name);
        return desc?.factoryRef;
    }
}
