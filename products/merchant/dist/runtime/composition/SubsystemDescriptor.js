/**
 * SubsystemDescriptor detailing a workspace subsystem's metadata.
 */
export class SubsystemDescriptor {
    name;
    dependencies;
    factoryRef;
    constructor(name, dependencies, factoryRef) {
        this.name = name;
        this.dependencies = dependencies;
        this.factoryRef = factoryRef;
        Object.freeze(this.dependencies);
        Object.freeze(this);
    }
}
