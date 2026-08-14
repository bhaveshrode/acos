/**
 * FactoryDescriptor encapsulating factory constructors and metadata rules.
 */
export class FactoryDescriptor {
  constructor(
    public readonly id: string,
    public readonly factoryClass: any,
    public readonly supportedCategories: string[] = [],
    public readonly metadata: Record<string, any> = {}
  ) {
    Object.freeze(this.supportedCategories);
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}
