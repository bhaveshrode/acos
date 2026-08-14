/**
 * FactoryContext carrying resolved application services maps and snapshots.
 */
export class FactoryContext {
  constructor(
    public readonly applicationServices: ReadonlyMap<string, any> = new Map(),
    public readonly dependencyProviders: ReadonlyMap<string, any> = new Map(),
    public readonly configurationSnapshot: Readonly<Record<string, any>> = {},
    public readonly compositionMetadata: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.applicationServices);
    Object.freeze(this.dependencyProviders);
    Object.freeze(this.configurationSnapshot);
    Object.freeze(this.compositionMetadata);
    Object.freeze(this);
  }
}
