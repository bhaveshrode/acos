/**
 * SubsystemDescriptor detailing a workspace subsystem's metadata.
 */
export class SubsystemDescriptor {
  constructor(
    public readonly name: string,
    public readonly dependencies: string[],
    public readonly factoryRef?: any
  ) {
    Object.freeze(this.dependencies);
    Object.freeze(this);
  }
}
